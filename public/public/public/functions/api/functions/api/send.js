export async function onRequestPost() {
  return Response.json(
    {
      success: false,
      message: "ارسال پیامک هنوز فعال نشده است. ابتدا باید API رسمی ارائه‌دهنده متصل شود."
    },
    { status: 503 }
  );
}
