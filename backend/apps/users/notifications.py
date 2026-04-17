"""
FCM push notification helper.

Gracefully no-ops if Firebase Admin SDK isn't configured (missing
GOOGLE_APPLICATION_CREDENTIALS env var or firebase_admin not installed),
so the API keeps working in local/dev environments.

To enable pushes in prod:
    1. pip install firebase-admin
    2. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
    3. Restart the server
"""
import logging

log = logging.getLogger(__name__)

_firebase_initialized = False
_firebase_app = None


def _ensure_firebase():
    global _firebase_initialized, _firebase_app
    if _firebase_initialized:
        return _firebase_app is not None
    _firebase_initialized = True
    try:
        import firebase_admin
        from firebase_admin import credentials
        if firebase_admin._apps:
            _firebase_app = firebase_admin.get_app()
        else:
            _firebase_app = firebase_admin.initialize_app(credentials.ApplicationDefault())
        return True
    except Exception as e:
        log.info("Firebase Admin not available — push notifications disabled (%s)", e)
        _firebase_app = None
        return False


def send_push(user, title: str, body: str, data: dict | None = None) -> int:
    """Send a push to all of a user's active device tokens. Returns count sent."""
    from .models import DeviceToken

    tokens = list(
        DeviceToken.objects.filter(user=user, is_active=True).values_list('token', flat=True)
    )
    if not tokens:
        return 0

    if not _ensure_firebase():
        log.info("[push-stub] to=%s title=%r body=%r tokens=%d", user.username, title, body, len(tokens))
        return 0

    try:
        from firebase_admin import messaging
        sent = 0
        invalid_tokens = []
        for tk in tokens:
            try:
                msg = messaging.Message(
                    notification=messaging.Notification(title=title, body=body),
                    data={k: str(v) for k, v in (data or {}).items()},
                    token=tk,
                )
                messaging.send(msg)
                sent += 1
            except Exception as send_err:
                err_str = str(send_err)
                if 'not found' in err_str.lower() or 'invalid' in err_str.lower():
                    invalid_tokens.append(tk)
                else:
                    log.warning("FCM send failed for token: %s", err_str)
        if invalid_tokens:
            DeviceToken.objects.filter(token__in=invalid_tokens).update(is_active=False)
        return sent
    except Exception as e:
        log.exception("Unexpected FCM error: %s", e)
        return 0
