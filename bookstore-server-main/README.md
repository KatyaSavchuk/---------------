# Серверна частина книжного магазину

Потрібна версія Python: ^3.12

Щоб запустити треба виконати наступну послідовність команд:

```sh
pip install poetry
poetry install
```

Після цього треба створити .env файл у корені проекта, та заповнити його:
```sh
DATABASE_NAME=your_database_name
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_HOST=your_database_host
DATABASE_PORT=your_database_port
```

Після цього створити базу даних у PostgreSQL з назвою, яка вказана у DATABASE_NAME.
Після цього виконати наступні команди:

```sh
poetry run python manage.py migrate
poetry run python manage.py runserver
```

Для заповнення бази даних можна скористатися командою:
```sh
poetry run python manage.py populate_db
```