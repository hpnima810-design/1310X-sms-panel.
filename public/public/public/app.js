let contacts = [];

async function login() {
  const password = document.getElementById("password").value;
  const message = document.getElementById("loginMessage");

  if (!password) {
    message.textContent = "رمز مدیریت را وارد کنید.";
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      document.getElementById("login").classList.add("hidden");
      document.getElementById("dashboard").classList.remove("hidden");
    } else {
      message.textContent = "ورود ناموفق بود.";
    }
  } catch {
    message.textContent = "اتصال به سرور برقرار نشد.";
  }
}

document.getElementById("contacts").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function() {
    const rows = reader.result.split(/\r?\n/).filter(Boolean);
    const headers = rows.shift().split(",").map(x => x.trim().toLowerCase());

    const phoneIndex = headers.indexOf("phone");
    const consentIndex = headers.indexOf("consent");

    if (phoneIndex === -1 || consentIndex === -1) {
      document.getElementById("contactCount").textContent =
        "ستون‌های phone و consent پیدا نشدند.";
      contacts = [];
      return;
    }

    const allowed = ["yes", "true", "1", "بله"];
    const unique = new Map();

    rows.forEach(row => {
      const columns = row.split(",");
      const phone = (columns[phoneIndex] || "").trim();
      const consent = (columns[consentIndex] || "").trim().toLowerCase();

      if (phone && allowed.includes(consent)) {
        unique.set(phone, phone);
      }
    });

    contacts = [...unique.values()];

    document.getElementById("contactCount").textContent =
      `${contacts.length} مخاطب دارای رضایت معتبر شناسایی شد.`;
  };

  reader.readAsText(file);
});

async function sendMessage() {
  document.getElementById("status").textContent =
    "ارسال واقعی در نسخه آزمایشی غیرفعال است. پس از اتصال API رسمی ارائه‌دهنده فعال می‌شود.";
}
