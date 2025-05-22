from typing import List, Optional
from sqlmodel import Session, select
from fastapi import HTTPException, status
from pathlib import Path
from app import models
from .auth import get_password_hash, verify_password
from app.config import settings
import os
from app import schemas

UPLOAD_DIR = settings.UPLOAD_DIR

def create_user(session: Session, user_in: models.UserCreate) -> models.User:
    hashed_password = get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        is_active=True
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def get_user_by_email(session: Session, email: str) -> Optional[models.User]:
    return session.exec(select(models.User).where(models.User.email == email)).first()

def get_user(session: Session, user_id: int) -> Optional[models.User]:
    return session.get(models.User, user_id)

def authenticate_user(session: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(session, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_document(session: Session, doc_in: models.DocumentCreate, owner_id: int, file_path: Path) -> models.Document:
    db_doc = models.Document(
        **doc_in.model_dump(exclude={'filename'}),
        owner_id=owner_id,
        filename=file_path.name
    )
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)
    return db_doc

def get_document(session: Session, document_id: int, user_id: int) -> Optional[models.Document]:
    statement = select(models.Document).where(models.Document.id == document_id)
    doc = session.exec(statement).first()
    if not doc:
        return None
    if doc.owner_id == user_id:
        return doc
    permission_statement = select(models.DocumentPermission).where(
        models.DocumentPermission.document_id == document_id,
        models.DocumentPermission.user_id == user_id,
        models.DocumentPermission.can_view == True
    )
    permission = session.exec(permission_statement).first()
    if permission:
        return doc
    return None

def get_document_for_download(session: Session, document_id: int, user_id: int) -> Optional[models.Document]:
    return get_document(session, document_id, user_id)

def get_documents_for_user(session: Session, user_id: int) -> List[models.Document]:
    owned_docs_statement = select(models.Document).where(models.Document.owner_id == user_id)
    owned_docs = session.exec(owned_docs_statement).all()
    shared_docs_permissions_statement = select(models.DocumentPermission).where(
        models.DocumentPermission.user_id == user_id,
        models.DocumentPermission.can_view == True
    )
    shared_permissions = session.exec(shared_docs_permissions_statement).all()
    shared_doc_ids = [perm.document_id for perm in shared_permissions]
    shared_docs = []
    if shared_doc_ids:
        shared_docs_statement = select(models.Document).where(models.Document.id.in_(shared_doc_ids))
        shared_docs = session.exec(shared_docs_statement).all()
    
    all_docs_dict = {doc.id: doc for doc in owned_docs}
    for doc in shared_docs:
        if doc.id not in all_docs_dict:
             all_docs_dict[doc.id] = doc
    return list(all_docs_dict.values())


def get_document_with_details(session: Session, document_id: int, user_id: int) -> Optional[models.Document]:
    doc = get_document(session, document_id, user_id)
    if not doc:
        return None

    session.refresh(doc, attribute_names=["owner", "permissions", "signatures"])
    for perm in doc.permissions:
        if perm.user_obj:
            session.refresh(perm.user_obj)
        else:
            pass
    for sig in doc.signatures:
        if sig.signer:
            session.refresh(sig.signer)
    return doc

def grant_permission(session: Session, document_id: int, owner_id: int, user_id_to_grant: int, can_view: bool, can_sign: bool) -> Optional[models.DocumentPermission]:
    doc = session.get(models.Document, document_id)
    if not doc or doc.owner_id != owner_id:
        return None
    if owner_id == user_id_to_grant:
        pass

    target_user = session.get(models.User, user_id_to_grant)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {user_id_to_grant} not found.")
    
    existing_permission = session.exec(
        select(models.DocumentPermission).where(
            models.DocumentPermission.document_id == document_id,
            models.DocumentPermission.user_id == user_id_to_grant
        )
    ).first()

    if existing_permission:
        existing_permission.can_view = can_view
        existing_permission.can_sign = can_sign
        session.add(existing_permission)
    else:
        db_permission = models.DocumentPermission(
            document_id=document_id,
            user_id=user_id_to_grant,
            can_view=can_view,
            can_sign=can_sign
        )
        session.add(db_permission)
        existing_permission = db_permission
    
    session.commit()
    session.refresh(existing_permission)
    if existing_permission.user_obj:
        session.refresh(existing_permission.user_obj)
    return existing_permission

def create_signature(session: Session, document_id: int, signer_id: int, signature_in: models.SignatureCreate) -> Optional[models.Signature]:
    doc = session.get(models.Document, document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    can_sign_this_document = False
    permission = session.exec(
        select(models.DocumentPermission).where(
            models.DocumentPermission.document_id == document_id,
            models.DocumentPermission.user_id == signer_id,
            models.DocumentPermission.can_sign == True
        )
    ).first()
    if permission:
        can_sign_this_document = True
    
    if not can_sign_this_document:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have permission to sign this document.")

    existing_signature = session.exec(
        select(models.Signature).where(
            models.Signature.document_id == document_id,
            models.Signature.signer_id == signer_id
        )
    ).first()
    if existing_signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document already signed by this user.")

    db_signature = models.Signature(
        document_id=document_id,
        signer_id=signer_id,
        comments=signature_in.comments
    )
    session.add(db_signature)
    session.commit()
    session.refresh(db_signature)
    if db_signature.signer:
        session.refresh(db_signature.signer)
    return db_signature

def delete_document(session: Session, document_id: int, owner_id: int) -> bool:
    doc = session.get(models.Document, document_id)
    if not doc:
        return False
    if doc.owner_id != owner_id:
        return False

    file_path = UPLOAD_DIR / doc.filename
    if file_path.exists():
        os.remove(file_path)

    session.exec(select(models.DocumentPermission).where(models.DocumentPermission.document_id == document_id)).all()
    for perm in session.exec(select(models.DocumentPermission).where(models.DocumentPermission.document_id == document_id)).all():
        session.delete(perm)
    
    for sig in session.exec(select(models.Signature).where(models.Signature.document_id == document_id)).all():
        session.delete(sig)

    session.delete(doc)
    session.commit()
    return True

def update_document(session: Session, document_id: int, owner_id: int, doc_update: models.DocumentCreate, new_file_path: Optional[Path] = None) -> Optional[models.Document]:
    doc = session.get(models.Document, document_id)
    if not doc:
        return None
    if doc.owner_id != owner_id:
        return None

    update_data = doc_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doc, key, value)

    if new_file_path:
        old_file_path = UPLOAD_DIR / doc.filename
        if old_file_path.exists():
            os.remove(old_file_path)
        
        doc.filename = new_file_path.name
        doc.original_filename = doc_update.original_filename
        doc.content_type = doc_update.content_type
        doc.upload_date = doc_update.upload_date

    session.add(doc)
    session.commit()
    session.refresh(doc)
    session.refresh(doc, attribute_names=["owner"])
    return doc

def get_users_with_document_access(session: Session, document_id: int) -> List[schemas.UserDocumentAccess]:
    document = session.get(models.Document, document_id)
    if not document:
        return []

    user_access_list: List[schemas.UserDocumentAccess] = []

    permissions_query = (
        select(models.DocumentPermission)
        .where(models.DocumentPermission.document_id == document_id)
    )
    doc_permissions = session.exec(permissions_query).all()

    for perm in doc_permissions:
        user = perm.user_obj
        
        if not user:
            user = session.get(models.User, perm.user_id) #

        if user:
            user_access_list.append(
                schemas.UserDocumentAccess(
                    user_id=user.id,
                    email=user.email,
                    full_name=user.full_name,
                    can_view=perm.can_view,
                    can_sign=perm.can_sign 
                )
            )
        else:
            print(f"Warning: User with ID {perm.user_id} not found for permission ID {perm.id}")
            
    return user_access_list
