#!/bin/sh

echo "Waiting for database..."
until pg_isready -h db -p 5432 -U postgres; do
  sleep 1
done

echo "Database is up!"

# КРИТИЧНО ДЛЯ ЖУРІ:
# Якщо папка migrations/versions порожня, створюємо першу міграцію автоматично
if [ ! "$(ls -A /app/app/migrations/versions/*.py 2>/dev/null)" ]; then
    echo "No migrations found. Generating initial migration based on models..."
    # Додаємо шлях до PYTHONPATH, щоб alembic бачив папку app
    export PYTHONPATH=$PYTHONPATH:/app
    alembic revision --autogenerate -m "Initial migration"
fi

echo "Applying migrations..."
alembic upgrade head

echo "Seeding database..."
# Додаємо перевірку, чи сідер не впаде через імпорти
export PYTHONPATH=$PYTHONPATH:/app
python seed.py

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000