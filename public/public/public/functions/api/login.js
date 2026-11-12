export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const data = await request.json();

    if (!env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: "تنظیمات مدیر انجام نشده است." },
        { status: 503 }
      );
    }

    if (data.password !== env.ADMIN_PASSWORD) {
      return Response.json(
        { success: false, message: "رمز اشتباه است." },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      message: "رمز تأیید شد."
    });
  } catch {
    return Response.json(
      { success: false, message: "درخواست نامعتبر است." },
      { status: 400 }
    );
  }
}
