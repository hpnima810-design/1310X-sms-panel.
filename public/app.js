let contacts = [];

function showDashboard(authenticated) {
  document.getElementById("login").classList.toggle("hidden", authenticated);
  document.getElementById("dashboard").classList.toggle("hidden", !authenticated);

  if (authenticated && !document.getElementById("logoutButton")) {
    const button = document.createElement("button");
    button.id = "logoutButton";
    button.textContent = "خروج";
    button.onclick = logout;
    document.getElementById("dashboard").prepend(button);
  }
}

async function checkSession() {
  try {
    const response = await fetch("/api/session", {
      credentials: "same-origin",
      cache: "no-store"
    });
    const data = await response.json();
    showDashboard(data.authenticated === true);
  } catch {
    showDashboard(false);
  }
}

async function login() {
  const password = document.getElementById("password").value;
  const message = document.getElementById("loginMessage");

  if (!password) {
    message.textContent = "رمز مدیریت را وارد کنید.";
    return;
  }

  message.textContent = "در حال بررسی...";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      message.textContent = data.message || "ورود ناموفق بود.";
      return;
    }

    document.getElementById("password").value = "";
    message.textContent = "";
    showDashboard(true);
  } catch {
    message.textContent = "ارتباط با سرور برقرار نشد.";
  }
}

async function logout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin"
    });
  } finally {
    contacts = [];
    document.getElementById("contacts").value = "";
    document.getElementById("contactCount").textContent =
      "هنوز فایلی انتخاب نشده است.";
    showDashboard(false);
  }
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && quoted && text[i + 1] === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some(value => value !== "")) rows.push(row);

  return rows;
}

document.getElementById("contacts").addEventListener("change", async event => {
  const file = event.target.files[0];
  const count = document.getElementById("contactCount");

  contacts = [];

  if (!file) {
    count.textContent = "هنوز فایلی انتخاب نشده است.";
    return;
  }

  try {
    const rows = parseCSV(await file.text());

    if (rows.length < 2) {
      count.textContent = "فایل CSV خالی یا نامعتبر است.";
      return;
    }

    const headers = rows[0].map(value => value.toLowerCase());
    const phoneIndex = headers.indexOf("phone");
    const consentIndex = headers.indexOf("consent");

    if (phoneIndex === -1 || consentIndex === -1) {
      count.textContent = "ستون‌های phone و consent باید در فایل باشند.";
      return;
    }

    const seen = new Set();

    for (const row of rows.slice(1)) {
      const phone = (row[phoneIndex] || "").trim();
      const consent = (row[consentIndex] || "").trim().toLowerCase();

      if (
        phone &&
        ["yes", "true", "1", "بله"].includes(consent) &&
        !seen.has(phone)
      ) {
        seen.add(phone);
        contacts.push(phone);
      }
    }

    count.textContent = `${contacts.length} شماره با رضایت ثبت‌شده شناسایی شد.`;
  } catch {
    count.textContent = "خواندن فایل با خطا مواجه شد.";
  }
});

function sendMessage() {
  document.getElementById("status").textContent =
    "ارسال پیامک در این نسخه غیرفعال است؛ فقط بررسی فایل و رضایت انجام می‌شود.";
}

checkSession();
