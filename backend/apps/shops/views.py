from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from apps.shops.models import Shop
from .serializers import ShopSerializer, ShopCreateSerializer, ShopDetailSerializer


class ShopViewSet(viewsets.ModelViewSet):
    """ViewSet for Shop CRUD operations"""
    
    queryset = Shop.objects.select_related('owner').filter(is_active=True)
    serializer_class = ShopSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['created_at', 'rating_average', 'name']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Custom permissions"""
        if self.action in ['list', 'retrieve', 'nearby']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'create':
            return ShopCreateSerializer
        if self.action == 'retrieve':
            return ShopDetailSerializer
        return ShopSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user"""
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        Get shops near a location
        Query params: lat, lng, radius (in km, default 10)
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = float(request.query_params.get('radius', 10))
        
        if not lat or not lng:
            return Response(
                {'error': 'lat and lng parameters required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return Response(
                {'error': 'Invalid lat or lng values'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple distance calculation (Haversine formula would be better)
        # For now, filtering by bounding box
        lat_range = radius / 111.0  # rough conversion km to degrees
        lng_range = radius / (111.0 * abs(lat))
        
        shops = self.queryset.filter(
            location_lat__gte=lat - lat_range,
            location_lat__lte=lat + lat_range,
            location_lng__gte=lng - lng_range,
            location_lng__lte=lng + lng_range
        )
        
        serializer = self.get_serializer(shops, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_shops(self, request):
        """Get current user's shops"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        shops = Shop.objects.filter(owner=request.user)
        serializer = self.get_serializer(shops, many=True)
        return Response(serializer.data)
