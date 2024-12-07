from rest_framework import viewsets, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Book, CartItem, Order, Review
from .permissions import IsAdminOrOwnerReadOnly, IsAdminOrReadOnly, IsOwnerOrAdmin
from .serializers import CartItemSerializer, CustomTokenObtainPairSerializer, BookSerializer, OrderSerializer, ReviewSerializer, UserRegistrationSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = super().get_queryset()
        author = self.request.query_params.get('author')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if author:
            queryset = queryset.filter(author=author)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def preview(self, request, pk=None):
        book = self.get_object()
        if book.preview_file:
            return FileResponse(book.preview_file.open(), content_type='application/pdf')
        else:
            return Response({'detail': 'Превью недоступно'}, status=404)

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdminOrOwnerReadOnly]

    def get_queryset(self):
        if 'book_pk' in self.kwargs:
            return Review.objects.filter(book_id=self.kwargs['book_pk'])
        return Review.objects.all()

    def perform_create(self, serializer):
        if 'book_pk' in self.kwargs:
            book = get_object_or_404(Book, pk=self.kwargs['book_pk'])
            serializer.save(user=self.request.user, book=book)
        else:
            serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        request = self.request
        if request.user.is_authenticated:
            return CartItem.objects.filter(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            return CartItem.objects.filter(session_key=session_key)

    def perform_create(self, serializer):
        serializer.save()

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwnerReadOnly]

    def get_queryset(self):
        # Возвращаем только заказы текущего пользователя
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def all_orders(self, request):
        # Эндпоинт для получения всех заказов администраторами
        orders = Order.objects.all()
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'patch'], permission_classes=[permissions.IsAdminUser], url_path='admin')
    def admin_order(self, request, pk=None):
        order = get_object_or_404(Order, id=pk)
        if request.method == 'PATCH':
            serializer = self.get_serializer(order, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(order)
        return Response(serializer.data)

class AuthorList(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        authors = Book.objects.values_list('author', flat=True).distinct()
        return Response(authors)