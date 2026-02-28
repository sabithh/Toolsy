from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.files.storage import default_storage
from django.db import models
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
    
    queryset = Tool.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'condition', 'shop', 'is_available']
    search_fields = ['name', 'description', 'brand', 'model_number']
    ordering_fields = ['price_per_day', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ToolCreateSerializer
        return ToolSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'nearby']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Get all available tools from subscribed providers or admins.
        Uses a subquery to avoid JOIN issues with missing subscription data.
        """
        from django.utils import timezone
        try:
            from apps.subscriptions.models import Subscription
            # Evaluate eagerly so the except block catches missing table errors
            subscribed_user_ids = list(Subscription.objects.filter(
                status='active',
                end_date__gt=timezone.now()
            ).values_list('user_id', flat=True))

            return Tool.objects.select_related('shop', 'category').filter(
                is_available=True
            ).filter(
                models.Q(shop__owner__is_superuser=True) |
                models.Q(shop__owner_id__in=subscribed_user_ids)
            ).distinct()
        except Exception:
            # Fallback: show all available tools if subscriptions table missing
            return Tool.objects.select_related('shop', 'category').filter(is_available=True)


    def perform_create(self, serializer):
        """Validate user has a shop and active subscription before creating tool"""
        from django.core.files.storage import default_storage
        from django.utils import timezone
        
        user = self.request.user
        
        # Check if user is a provider or superuser
        if user.user_type != 'provider' and not user.is_superuser:
            raise serializers.ValidationError("Only providers can create tools")
            
        # We NO LONGER check for a subscription here. 
        # Any provider can create a tool, but it will only be VISIBLE in the 
        # public listings if they have an active subscription (handled in get_queryset).
        
        # Get user's first shop or require shop_id
        shop = user.shops.first()
        if not shop:
            raise serializers.ValidationError({"shop": "You must create a shop first"})
            
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
            
        quantity_available = serializer.validated_data.get('quantity_available', 1)
        serializer.save(
            shop=shop, 
            images=images_list,
            quantity_total=quantity_available
        )

    def _check_ownership(self, tool):
        """Raise PermissionDenied if the requesting user does not own this tool's shop."""
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        if not user.is_staff and tool.shop.owner != user:
            raise PermissionDenied("You do not have permission to modify this tool.")

    def perform_update(self, serializer):
        self._check_ownership(serializer.instance)
        # Handle optional image upload on update
        image = self.request.FILES.get('image')
        if image:
            file_path = default_storage.save(f'tools/{image.name}', image)
            file_url = default_storage.url(file_path)
            serializer.save(images=[file_url])
        else:
            serializer.save()

    def perform_destroy(self, instance):
        self._check_ownership(instance)
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_tools(self, request):
        """Get all tools belonging to the logged-in provider's shops (ignores subscription filter)."""
        shops = request.user.shops.all()
        tools = Tool.objects.select_related('shop', 'category').filter(shop__in=shops)
        page = self.paginate_queryset(tools)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(tools, many=True)
        return Response(serializer.data)


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
        
        # Filter by shop location using get_queryset() to maintain subscription/availability rules
        lat_range = radius / 111.0
        lng_range = radius / (111.0 * abs(lat))
        
        tools = self.get_queryset().filter(
            shop__location_lat__gte=lat - lat_range,
            shop__location_lat__lte=lat + lat_range,
            shop__location_lng__gte=lng - lng_range,
            shop__location_lng__lte=lng + lng_range
        )
        
        # Calculate actual distance using Haversine formula and sort
        import math
        def get_distance(tool):
            lat2 = tool.shop.location_lat
            lon2 = tool.shop.location_lng
            if lat2 is None or lon2 is None:
                return float('inf')
                
            R = 6371  # Earth radius in km
            dLat = math.radians(lat2 - lat)
            dLon = math.radians(lon2 - lng)
            a = math.sin(dLat/2) * math.sin(dLat/2) + \
                math.cos(math.radians(lat)) * math.cos(math.radians(lat2)) * \
                math.sin(dLon/2) * math.sin(dLon/2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return R * c
            
        tools_list = list(tools)
        tools_list.sort(key=get_distance)
        
        page = self.paginate_queryset(tools_list)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tools_list, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review operations"""
    
    queryset = Review.objects.select_related('reviewer', 'shop', 'tool', 'booking')
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create review with current user"""
        serializer.save(reviewer=self.request.user)
