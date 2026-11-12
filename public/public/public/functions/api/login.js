export async function onRequestPost({ request, env }) {
  try {
    if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
      return Response.json(
        { success: false, message: "تنظیمات امنیتی ناقص است." },
        { status: 503 }
      );
    }

    const data = await request.json();

    if (
      typeof data.password !== "string" ||
      data.password !== env.ADMIN_PASSWORD
    ) {
      return Response.json(
        { success: false, message: "رمز اشتباه است." },
        { status: 401 }
      );
    }

    const token = crypto.randomUUID() + "." + crypto.randomUUID();

    const signature = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.SESSION_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      new TextEncoder().encode(token)
    );

    const signed = token + "." +
      btoa(String.fromCharCode(...new Uint8Array(signature)));

    return new Response(
      JSON.stringify({ success: true, message: "ورود تأیید شد." }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `admin_session=${signed}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
        }
      }
    );
  } catch {
    return Response.json(
      { success: false, message: "درخواست نامعتبر است." },
      { status: 400 }
    );
  }
}
