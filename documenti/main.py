import uvicorn
from api_v1.users.routes import router as users_router
from api_v1 import router as router_v1
from core.config import settings
from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.models import Base, db_helper


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with db_helper.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(router=router_v1, prefix=settings.api_v1_prefix)
app.include_router(users_router)


@app.get("/")
@app.get("/main")
def main():
    return {
        "message": "Hello World!",
    }


if __name__ == '__main__':
    uvicorn.run("main:app", reload=True)