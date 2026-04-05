FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Додаємо postgresql-client для перевірки готовності бази
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Робимо entrypoint.sh виконуваним
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Міняємо CMD на ENTRYPOINT
ENTRYPOINT ["/app/entrypoint.sh"]