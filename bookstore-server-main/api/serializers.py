from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CartItem, Order, OrderBook, Review, User, Book

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['is_staff'] = user.is_staff
        return token

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'customer')
        )
        return user

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

    def get_cover_url(self, obj):
        return obj.get_cover_url()
    
    def get_preview_url(self, obj):
        request = self.context.get('request')
        if obj.preview_file and request.user.is_authenticated:
            return request.build_absolute_uri(obj.preview_file.url)
        return None

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_email', 'book', 'book_title', 'rating', 'comment', 'created_at', 'updated_at')
        extra_kwargs = {
            'book': {'required': False},
            'user': {'read_only': True}
        }

    def validate(self, data):
        request = self.context.get('request')
        view = self.context.get('view')
        if not data.get('book') and 'book_pk' not in view.kwargs:
            raise serializers.ValidationError({'book': 'Это поле обязательно.'})
        return data

class CartItemSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)  # Вложенный сериализатор для чтения
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )
    
    class Meta:
        model = CartItem
        fields = ('id', 'book', 'book_id', 'quantity', 'added_at')
        read_only_fields = ('id', 'added_at')

    def create(self, validated_data):
        request = self.context.get('request')
        book = validated_data['book']
        quantity = validated_data.get('quantity', 1)

        if request.user.is_authenticated:
            cart_item, created = CartItem.objects.update_or_create(
                user=request.user,
                book=book,
                defaults={'quantity': quantity}
            )
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            cart_item, created = CartItem.objects.update_or_create(
                session_key=session_key,
                book=book,
                defaults={'quantity': quantity}
            )
        return cart_item

class OrderBookSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = OrderBook
        fields = ('book', 'book_title', 'book_quantity')

class OrderSerializer(serializers.ModelSerializer):
    books = OrderBookSerializer(many=True, write_only=True)
    books_read = OrderBookSerializer(many=True, read_only=True, source='orderbook_set')
    total_price = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'user_email', 'status', 'books', 'books_read', 'total_price', 'created_at', 'updated_at')
        read_only_fields = ('user', 'user_email', 'total_price', 'created_at', 'updated_at')

    def create(self, validated_data):
        books_data = validated_data.pop('books')
        order = Order.objects.create(user=self.context['request'].user)
        for book_data in books_data:
            OrderBook.objects.create(order=order, **book_data)
        # Очистить корзину пользователя
        CartItem.objects.filter(user=self.context['request'].user).delete()
        return order

    def get_total_price(self, obj):
        total = sum([item.book.price * item.book_quantity for item in obj.orderbook_set.all()])
        return total