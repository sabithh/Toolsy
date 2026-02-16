from rest_framework import permissions

class IsToolOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of the tool's shop to edit/delete it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner of the shop
        return obj.shop.owner == request.user
