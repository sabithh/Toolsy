# Firebase Setup (required for push notifications)

The app works without Firebase — it just falls back to local notifications only
and skips push registration. To enable real push notifications:

## 1. Create a Firebase project
- Go to https://console.firebase.google.com
- Create project "Vaadaka" (or similar)
- Add an Android app with package name `com.vaadaka.vaadaka`

## 2. Download `google-services.json`
- Download from Firebase console
- Place at: `mobile/android/app/google-services.json`

## 3. Wire Google Services gradle plugin
Edit `mobile/android/settings.gradle.kts` and add inside `plugins { ... }`:
```kotlin
id("com.google.gms.google-services") version "4.4.2" apply false
```

Edit `mobile/android/app/build.gradle.kts` and add at the top of `plugins { ... }` block:
```kotlin
id("com.google.gms.google-services")
```

## 4. Backend — Firebase Admin credentials
On the Oracle server (where the Django backend runs):
```bash
pip install firebase-admin
# Download service-account.json from Firebase console (Project Settings → Service Accounts)
# Scp it to the server, e.g.:
scp service-account.json ubuntu@vaadaka:/opt/vaadaka/service-account.json
# Add to .env.production:
GOOGLE_APPLICATION_CREDENTIALS=/opt/vaadaka/service-account.json
# Restart:
docker compose up -d --force-recreate backend
```

Until those steps are done, `send_push()` is a silent no-op (logs only).

## 5. Run backend migration
```bash
python manage.py migrate users
```
This creates the `device_tokens` table.

## iOS (later)
- Add iOS app in Firebase, download `GoogleService-Info.plist`
- Place in `mobile/ios/Runner/GoogleService-Info.plist`
- Enable Push Notifications + Background Modes (Remote notifications) capabilities in Xcode
- Upload APNs auth key to Firebase console
