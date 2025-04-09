from .base import Base
from sqlalchemy.orm import Mapped

class File(Base):
    __tablename__ = "files"
    
    name: Mapped[str]
    extension: Mapped[str]
