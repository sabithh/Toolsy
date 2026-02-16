from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.tools.models import Tool, ToolCategory, Review
from .serializers import (
    ToolSerializer, ToolCreateSerializer, ToolCategorySerializer, ReviewSerializer
)


class ToolCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ToolCategory (read-only)"""
    
    queryset = ToolCategory.objects.all()
    serializer_class = ToolCategorySerializer
    permission_classes = [AllowAny]


class ToolViewSet(viewsets.ModelViewSet):
    """ViewSet for Tool CRUD operations"""
    
    queryset = Tool.objects.select_related('shop', 'category').filter(is_available=True)
    serializer_class = ToolSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'condition', 'shop']
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price_per_day', 'created_at', 'name']
    ordering = ['-created_at']
    
    
    def get_permissions(self):
        """Custom permissions"""
        from .permissions import IsToolOwnerOrReadOnly
        if self.action in ['list', 'retrieve', 'nearby']:
            return [AllowAny()]
        return [IsAuthenticated(), IsToolOwnerOrReadOnly()]
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'create':
            return ToolCreateSerializer
        return ToolSerializer
    
    def perform_create(self, serializer):
        """Validate user has a shop before creating tool"""
        from django.core.files.storage import default_storage
        
        user = self.request.user
        
        # Check if user is a provider
        if user.user_type != 'provider':
            raise serializers.ValidationError("Only providers can create tools")
        
        # Get user's first shop or require shop_id
        shop = user.shops.first()
        if not shop:
            raise serializers.ValidationError("You must create a shop first")
            
        # Handle image upload
        # Frontend sends 'image' (single file), Model expects 'images' (list of URLs)
        image = self.request.FILES.get('image')
        images_list = []
        
        if image:
            # Save file to media directory
            file_path = default_storage.save(f'tools/{image.name}', image)
            # Get URL (ensure it starts with /media/ if not already)
            file_url = default_storage.url(file_path)
            images_list = [file_url]
            
        serializer.save(shop=shop, images=images_list)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get tools from nearby shops"""
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
        
        # Filter by shop location
        lat_range = radius / 111.0
        lng_range = radius / (111.0 * abs(lat))
        
        tools = self.queryset.filter(
            shop__location_lat__gte=lat - lat_range,
            shop__location_lat__lte=lat + lat_range,
            shop__location_lng__gte=lng - lng_range,
            shop__location_lng__lte=lng + lng_range
        )
        
        page = self.paginate_queryset(tools)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tools, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review operations"""
    
    queryset = Review.objects.select_related('reviewer', 'shop', 'tool', 'booking')
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create review with current user"""
        serializer.save(reviewer=self.request.user)
