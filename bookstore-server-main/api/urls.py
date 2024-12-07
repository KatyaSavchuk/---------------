from rest_framework import routers
from rest_framework_nested import routers as nested_routers

from django.urls import include, path

from .views import BookViewSet, CartItemViewSet, OrderViewSet, ReviewViewSet, UserRegistrationView, ReviewViewSet, AuthorList


router = routers.DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'cart', CartItemViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')

books_router = nested_routers.NestedDefaultRouter(router, r'books', lookup='book')
books_router.register(r'reviews', ReviewViewSet, basename='book-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(books_router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('authors/', AuthorList.as_view(), name='author-list'),
]