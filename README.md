# Document Spinning
## What is this
Our project for web-document processing using Python, TypeScript, SQLAlchemy, Uvicorn and others
## To start everything up:
# You'll need Node.js installed, though I'm not exactly sure what you'll need. Create .env file with SECRET_KEY="key itself", you can get itt from Telegram. Then:
```
docker-compose up --build -d
```
### In current production http://localhost:3000 will become active
## To get backend logging :
```
docker-compose logs -f
```
## To get frontend logging:
### Open http://localhost:3000 >> F12 >> console
## To stop everything down:
```
docker-compose down
```
