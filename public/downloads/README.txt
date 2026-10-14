Place the Android APK here, named exactly:

  app-release.apk

It will be served at: /downloads/app-release.apk

The QR code on the landing page (src/app/page.tsx) points to that URL.
If the APK is hosted elsewhere (Firebase Storage, S3, GitHub Releases...),
set NEXT_PUBLIC_APK_DOWNLOAD_URL in .env.local instead — no rebuild of the QR logic needed.
