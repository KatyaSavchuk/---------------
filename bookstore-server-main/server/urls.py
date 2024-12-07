from rest_framework_simplejwt.views import TokenRefreshView

from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from api.views import CustomTokenObtainPairView

urlpatterns = [
    path('api/', include('api.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
