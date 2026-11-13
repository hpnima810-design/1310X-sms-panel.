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

    const [id, expiry, signature] = parts;

    if (!Number.isFinite(Number(expiry)) || Date.now() > Number(expiry)) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

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
      new TextEncoder().encode(`${id}.${expiry}`)
    );

    return Response.json(
      { authenticated: valid },
      { status: valid ? 200 : 401 }
    );
  } catch {
    return Response.json({ authenticated: false }, { status: 401 });
  }
}
