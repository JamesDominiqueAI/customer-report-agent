FROM python:3.12-slim

WORKDIR /app

COPY backend/api/requirements-lambda.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY backend /app/backend
COPY data /app/data

WORKDIR /app/backend/api

ENV BACKEND_HOST=0.0.0.0
ENV BACKEND_PORT=8010

CMD ["python", "main.py"]
