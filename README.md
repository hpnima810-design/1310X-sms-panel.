# ßnđərX — Cloudflare Pages starter

نسخه آزمایشی پنل فارسی. ارسال پیامک عمداً غیرفعال است.

## فایل‌ها
- `public/`: رابط فارسی و راست‌چین
- `functions/api/login.js`: ورود و ساخت کوکی نشست امضاشده
- `functions/api/session.js`: بررسی نشست و انقضای یک‌ساعته
- `functions/api/logout.js`: خروج
- `functions/api/_middleware.js`: محافظت از APIهای دیگر
- `functions/_lib/session.js`: ابزار امضای HMAC
- `functions/api/send.js`: ارسال غیرفعال (503)

## تنظیم Cloudflare Pages
Framework preset: None
Build command: خالی
Build output directory: public
Root directory: پیش‌فرض `/`

در تنظیمات پروژه، برای محیط Production دو مقدار از نوع Secret بسازید:
- `ADMIN_PASSWORD`: رمز مدیر قوی و منحصربه‌فرد
- `SESSION_SECRET`: مقدار تصادفی محرمانه حداقل ۳۲ بایت

این مقادیر را در GitHub یا چت قرار ندهید. پس از افزودن Secretها، Deploy جدید لازم است.

## محدودیت‌ها و نکات
- این starter پیش از استفاده عمومی نیازمند بازبینی فنی و آزمون امنیتی است.
- rate limiting برای تلاش‌های ورود هنوز تنظیم نشده؛ قبل از انتشار عمومی، Cloudflare Rate Limiting/WAF را پیکربندی کنید.
- ارسال پیامک واقعی عمداً پیاده‌سازی نشده است. فقط پس از اتصال API رسمی، بررسی مقررات ارائه‌دهنده، رضایت گیرندگان و آزمون امنیتی می‌توان آن را جداگانه افزود.
- CSV با سرستون‌های `phone,consent` پشتیبانی می‌شود؛ رضایت فقط با `yes`, `true`, `1`, `بله` پذیرفته می‌شود. XLSX فعلاً پشتیبانی نمی‌شود.
- فایل مخاطبان فقط در مرورگر خوانده می‌شود و به سرور آپلود نمی‌شود.
