"use strict";

let contacts = [];

const $ = id => document.getElementById(id);

function showDashboard(authenticated) {
  $("login").classList.toggle("hidden", authenticated);
  $("dashboard").classList.toggle("hidden", !authenticated);
}

async function checkSession() {
  try {
    const response = await fetch("/api/session", {
      credentials: "same-origin",
      cache: "no-store"
    });

    const data = await response.json();
    showDashboard(response.ok && data.authenticated === true);
  } catch {
    showDashboard(false);
  }
}

async function login() {
  const password = $("password").value;
  const message = $("loginMessage");

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

    $("password").value = "";
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
    $("contacts").value = "";
    $("contactCount").textContent = "۰";
    $("fileStatus").textContent = "هنوز فایلی انتخاب نشده است.";
    $("message").value = "";
    $("charCount").textContent = "تعداد کاراکتر: ۰";
    $("preview").classList.add("hidden");
    $("status").textContent = "";
    showDashboard(false);
  }
}

function normalizePhone(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

async function readContacts(file) {
  if (!window.XLSX) {
    throw new Error("کتابخانه Excel بارگذاری نشده است.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error("برگه‌ای در فایل پیدا نشد.");
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ""
  });

  if (rows.length < 2) {
    throw new Error("فایل مخاطبان خالی است.");
  }

  const headers = rows[0].map(value =>
    String(value).trim().toLowerCase()
  );

  const phoneIndex = headers.findIndex(value =>
    ["phone", "mobile", "number", "شماره", "موبایل", "تلفن"].includes(value)
  );

  if (phoneIndex === -1) {
    throw new Error("ستون شماره باید عنوان phone یا شماره یا موبایل داشته باشد.");
  }

  const unique = new Set();

  for (const row of rows.slice(1)) {
    const phone = normalizePhone(row[phoneIndex]);

    if (phone) unique.add(phone);
  }

  return [...unique];
}

$("loginButton").addEventListener("click", login);

$("password").addEventListener("keydown", event => {
  if (event.key === "Enter") login();
});

$("logoutButton").addEventListener("click", logout);

$("contacts").addEventListener("change", async event => {
  const file = event.target.files[0];

  contacts = [];
  $("contactCount").textContent = "۰";

  if (!file) return;

  $("fileStatus").textContent = "در حال خواندن فایل...";

  try {
    contacts = await readContacts(file);

    $("contactCount").textContent =
      contacts.length.toLocaleString("fa-IR");

    $("fileStatus").textContent =
      `${contacts.length.toLocaleString("fa-IR")} شماره یکتا شناسایی شد.`;
  } catch (error) {
    $("fileStatus").textContent = error.message;
    contacts = [];
  }
});

$("message").addEventListener("input", event => {
  $("charCount").textContent =
    "تعداد کاراکتر: " +
    event.target.value.length.toLocaleString("fa-IR");

  $("preview").classList.add("hidden");
});

$("previewButton").addEventListener("click", () => {
  const message = $("message").value.trim();

  if (!message) {
    $("status").textContent = "ابتدا متن پیام را وارد کنید.";
    return;
  }

  if (contacts.length === 0) {
    $("status").textContent = "ابتدا فایل مخاطبان را انتخاب کنید.";
    return;
  }

  $("preview").textContent = message;
  $("preview").classList.remove("hidden");

  $("status").textContent =
    `پیش‌نمایش آماده است. تعداد مخاطبان: ${contacts.length.toLocaleString("fa-IR")} — ارسال واقعی هنوز فعال نیست.`;
});

checkSession();
