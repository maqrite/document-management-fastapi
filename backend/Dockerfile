FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000 \
    DB_NAME="document_flow.db" \
    UPLOAD_DIR_NAME="uploads"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

RUN mkdir -p /app/${UPLOAD_DIR_NAME}

EXPOSE ${UVICORN_PORT}

CMD uvicorn app.main:app --host ${UVICORN_HOST} --port ${UVICORN_PORT}