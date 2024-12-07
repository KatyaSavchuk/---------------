from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Book, Review, Order, OrderBook, CartItem
import random
import requests

class Command(BaseCommand):
    help = 'Заполняет базу данных тестовыми данными с использованием реальных книг и их ISBN'

    def handle(self, *args, **kwargs):
        self.stdout.write('Начало заполнения базы данных...')

        # # Создание пользователей
        User.objects.create_superuser(email='admin@example.com', password='adminpassword')
        user1 = User.objects.create_user(email='user1@example.com', password='userpassword')
        user2 = User.objects.create_user(email='user2@example.com', password='userpassword')

        self.stdout.write('Пользователи созданы.')

        # Список ISBN для реальных книг
        isbn_list = [
            '9780140328721',
            '9780451524935',
            '9780439139601',
            '9780747532743',
            '9780316769488'
        ]

        books = []

        for isbn in isbn_list:
            # Получение данных о книге из Open Library API
            response = requests.get(f'https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data')
            data = response.json()
            book_data = data.get(f'ISBN:{isbn}', None)

            if book_data:
                title = book_data.get('title', 'Нет названия')
                authors = ', '.join([author['name'] for author in book_data.get('authors', [])]) or 'Нет автора'

                # Создание книги
                book = Book.objects.create(
                    title=title,
                    author=authors,
                    description=book_data.get('notes', 'Нет описания'),
                    isbn=isbn,
                    price=random.uniform(10.0, 100.0),
                    stock=random.randint(5, 20),
                    published_date=timezone.now().date(),
                )
                books.append(book)

        self.stdout.write('Книги созданы.')

        # Создание отзывов
        for book in books:
            Review.objects.create(
                user=user1,
                book=book,
                rating=random.randint(1, 5),
                comment=f'Отзыв пользователя 1 на {book.title}',
            )
            Review.objects.create(
                user=user2,
                book=book,
                rating=random.randint(1, 5),
                comment=f'Отзыв пользователя 2 на {book.title}',
            )
        self.stdout.write('Отзывы созданы.')

        # Создание элементов корзины для пользователя 1
        for book in books[:3]:
            CartItem.objects.create(
                user=user1,
                book=book,
                quantity=random.randint(1, 3),
            )
        self.stdout.write('Корзина пользователя 1 создана.')

        # Создание заказа для пользователя 1
        order = Order.objects.create(user=user1, status='completed')
        for book in books[2:]:
            OrderBook.objects.create(
                order=order,
                book=book,
                book_quantity=random.randint(1, 2),
            )
        self.stdout.write('Заказ пользователя 1 создан.')

        self.stdout.write(self.style.SUCCESS('Заполнение базы данных успешно завершено.'))