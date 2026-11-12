export async function onRequestGet({ request, env }) {
  try {
    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);

    if (!match || !env.SESSION_SECRET) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const parts = match[1].split(".");
    if (parts.length !== 3) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const [id1, id2, signature] = parts;
    const token = `${id1}.${id2}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const binary = atob(signature);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      bytes,
      new TextEncoder().encode(token)
    );

    if (!valid) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    return Response.json({ authenticated: true });
  } catch {
    return Response.json({ authenticated: false }, { status: 401 });
  }
}
