from typing import Optional, List
from sqlmodel import SQLModel
from pydantic import BaseModel
from app.models import UserRead, DocumentRead, DocumentPermissionRead, SignatureRead

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DocumentUploadResponse(SQLModel):
    message: str
    document: DocumentRead

class ShareDocumentRequest(SQLModel):
    user_id_to_grant: int
    can_view: bool = True
    can_sign: bool = False

class DocumentListResponse(SQLModel):
    documents: List[DocumentRead]

class DocumentDetailResponse(DocumentRead):
    permissions: List[DocumentPermissionRead] = []
    signatures: List[SignatureRead] = []