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
      data.password.length > 256 ||
      data.password !== env.ADMIN_PASSWORD
    ) {
      return Response.json(
        { success: false, message: "رمز اشتباه است." },
        { status: 401 }
      );
    }

    const id = crypto.randomUUID();
    const expiry = Date.now() + 3600000;
    const token = `${id}.${expiry}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(token)
    );

    const signed = token + "." +
      btoa(String.fromCharCode(...new Uint8Array(signature)));

    return Response.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": `admin_session=${signed}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
          "Cache-Control": "no-store"
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
