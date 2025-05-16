from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    is_active: bool = Field(default=True)

    owned_documents: List["Document"] = Relationship(back_populates="owner")
    permissions_granted: List["DocumentPermission"] = Relationship(back_populates="user_obj")
    signatures_made: List["Signature"] = Relationship(back_populates="signer")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    is_active: bool

class DocumentBase(SQLModel):
    title: str
    description: Optional[str] = None
    filename: str
    original_filename: str
    content_type: Optional[str] = None
    upload_date: datetime = Field(default_factory=datetime.utcnow)

class Document(DocumentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")

    owner: User = Relationship(back_populates="owned_documents")
    permissions: List["DocumentPermission"] = Relationship(back_populates="document")
    signatures: List["Signature"] = Relationship(back_populates="document")

class DocumentCreate(DocumentBase):
    pass

class DocumentRead(DocumentBase):
    id: int
    owner_id: int
    owner: Optional[UserRead] = None

class DocumentPermissionBase(SQLModel):
    can_view: bool = Field(default=True)
    can_sign: bool = Field(default=False)
    granted_at: datetime = Field(default_factory=datetime.utcnow)

class DocumentPermission(DocumentPermissionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id")
    user_id: int = Field(foreign_key="user.id")

    document: Document = Relationship(back_populates="permissions")
    user_obj: User = Relationship(back_populates="permissions_granted")

class DocumentPermissionCreate(SQLModel):
    user_id_to_grant: int
    can_view: bool = True
    can_sign: bool = False

class DocumentPermissionRead(DocumentPermissionBase):
    id: int
    document_id: int
    user_id: int
    user: Optional[UserRead] = None

class SignatureBase(SQLModel):
    signed_at: datetime = Field(default_factory=datetime.utcnow)
    comments: Optional[str] = None

class Signature(SignatureBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="document.id")
    signer_id: int = Field(foreign_key="user.id")

    document: Document = Relationship(back_populates="signatures")
    signer: User = Relationship(back_populates="signatures_made")

class SignatureCreate(SQLModel):
    comments: Optional[str] = None

class SignatureRead(SignatureBase):
    id: int
    document_id: int
    signer_id: int
    signer: Optional[UserRead] = None