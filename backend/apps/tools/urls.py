from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ToolViewSet, ToolCategoryViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'tools', ToolViewSet, basename='tool')
router.register(r'categories', ToolCategoryViewSet, basename='category')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
