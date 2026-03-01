"""
One-time setup endpoint to create the initial superuser.
Protected by SETUP_SECRET environment variable.
Automatically disables itself once a superuser exists.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
import sys
from io import StringIO

User = get_user_model()


class SetupAdminView(APIView):
    """
    POST /api/setup/create-admin/
    Body: { "secret": "...", "username": "...", "email": "...", "password": "..." }

    Creates the first superuser. Disabled once any superuser exists.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        # Block if superuser already exists (one-time use)
        if User.objects.filter(is_superuser=True).exists():
            return Response(
                {"error": "Admin already exists. This endpoint is disabled."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verify setup secret
        setup_secret = getattr(settings, 'SETUP_SECRET', None)
        if not setup_secret:
            return Response(
                {"error": "SETUP_SECRET not configured on server."},
                status=status.HTTP_403_FORBIDDEN
            )

        provided_secret = request.data.get('secret')
        if provided_secret != setup_secret:
            return Response(
                {"error": "Invalid secret."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate fields
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not all([username, email, password]):
            return Response(
                {"error": "username, email, and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        return Response({
            "success": True,
            "message": f"Superuser '{user.username}' created successfully. This endpoint is now permanently disabled.",
            "user_id": str(user.id),
        }, status=status.HTTP_201_CREATED)


class MigrateDatabaseView(APIView):
    """
    GET or POST /api/setup/migrate/
    Query Param: ?secret=...
    Body: { "secret": "..." }

    Runs django database migrations remotely. Intended for environments without shell access.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        return self._run_migrate(request)

    def _run_migrate(self, request):
        setup_secret = getattr(settings, 'SETUP_SECRET', None)
        
        # We need a secret to exist on the server to allow this, for safety.
        if not setup_secret:
            return Response(
                {"error": "SETUP_SECRET not configured on server. Remote migration is disabled."},
                status=status.HTTP_403_FORBIDDEN
            )

        provided_secret = request.query_params.get('secret') or request.data.get('secret')
        
        if provided_secret != setup_secret:
            return Response(
                {"error": "Invalid secret. Access denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Run migration and capture output
        out = StringIO()
        try:
            call_command('migrate', stdout=out, stderr=sys.stderr)
            output = out.getvalue()
            return Response({
                "success": True,
                "message": "Migrations applied successfully!",
                "output": output
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Migration failed: {str(e)}",
                "output": out.getvalue()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
