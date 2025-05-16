from typing import List, Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlmodel import Session
from pathlib import Path
import shutil
import uuid
from .. import crud, models, schemas, dependencies, auth

from app.config import settings
UPLOAD_DIR = settings.UPLOAD_DIR

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
    dependencies=[Depends(auth.get_current_active_user)]
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload/", response_model=schemas.DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: Annotated[str, Form()],
    description: Annotated[Optional[str], Form()] = None,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user),
    session: Session = Depends(dependencies.get_session)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided or filename is missing.")

    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        if file:
             file.file.close()

    doc_in = models.DocumentCreate(
        title=title,
        description=description,
        filename=unique_filename,
        original_filename=file.filename,
        content_type=file.content_type,
    )
    db_document = crud.create_document(session=session, doc_in=doc_in, owner_id=current_user.id, file_path=file_path)
    session.refresh(db_document, attribute_names=["owner"])
    
    doc_read = schemas.DocumentRead.model_validate(db_document)
    return schemas.DocumentUploadResponse(
        message="Document uploaded successfully",
        document=doc_read
    )

@router.get("/", response_model=schemas.DocumentListResponse)
def read_documents_for_user(
    current_user: models.User = Depends(auth.get_current_active_user),
    session: Session = Depends(dependencies.get_session)
):
    documents = crud.get_documents_for_user(session=session, user_id=current_user.id)
    docs_read_list = []
    for doc_model in documents:
        session.refresh(doc_model, attribute_names=["owner"])
        docs_read_list.append(schemas.DocumentRead.model_validate(doc_model))
    return schemas.DocumentListResponse(documents=docs_read_list)


@router.get("/{document_id}/", response_model=schemas.DocumentDetailResponse)
def read_document_details(
    document_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    session: Session = Depends(dependencies.get_session)
):
    db_doc = crud.get_document_with_details(session=session, document_id=document_id, user_id=current_user.id)
    if db_doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or access denied.")
    return schemas.DocumentDetailResponse.model_validate(db_doc)


@router.get("/{document_id}/download/")
async def download_document(
    document_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    session: Session = Depends(dependencies.get_session)
):
    db_doc = crud.get_document_for_download(session=session, document_id=document_id, user_id=current_user.id)
    if db_doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or access denied.")

    file_path = UPLOAD_DIR / db_doc.filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on server.")

    from fastapi.responses import FileResponse
    return FileResponse(
        path=file_path,
        filename=db_doc.original_filename,
        media_type=db_doc.content_type or 'application/octet-stream'
    )


@router.post("/{document_id}/share/", response_model=schemas.DocumentPermissionRead)
def share_document(
    document_id: int,
    share_request: schemas.ShareDocumentRequest,
    current_user: models.User = Depends(auth.get_current_active_user),
    session: Session = Depends(dependencies.get_session)
):
    permission = crud.grant_permission(
        session=session,
        document_id=document_id,
        owner_id=current_user.id,
        user_id_to_grant=share_request.user_id_to_grant,
        can_view=share_request.can_view,
        can_sign=share_request.can_sign
    )
    if permission is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not grant permission. User may not be owner or document/target user not found.")
    
    session.refresh(permission, attribute_names=["user_obj"])
    if permission.user_obj:
         session.refresh(permission.user_obj)

    return schemas.DocumentPermissionRead.model_validate(permission)


@router.post("/{document_id}/sign/", response_model=schemas.SignatureRead)
def sign_document(
    document_id: int,
    signature_in: models.SignatureCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    session: Session = Depends(dependencies.get_session)
):
    signature = crud.create_signature(
        session=session,
        document_id=document_id,
        signer_id=current_user.id,
        signature_in=signature_in
    )
    if signature is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create signature.")
    
    session.refresh(signature, attribute_names=["signer"])
    if signature.signer:
        session.refresh(signature.signer)
        
    return schemas.SignatureRead.model_validate(signature)