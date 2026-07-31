// ============================================================
// Flevosap Duitsland Agent - app.js
// ============================================================

const SUPABASE_URL = "https://iacfupckaxcnugtwioww.supabase.co";
const SUPABASE_KEY = "sb_publishable_cojow307LM2r5mBU9WzfHw_olk2vla_";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentRole = null;
let currentUser = null;
let allCustomers = [];
let allVisits = [];
let allCalls = [];

// ---------- DOM refs ----------
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signoutBtn = document.getElementById("signout-btn");
const whoEmail = document.getElementById("who-email");
const whoRole = document.getElementById("who-role");

// ---------- AUTH ----------
async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await enterApp(session.user);
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = "flex";
  appScreen.style.display = "none";
}

async function enterApp(user) {
  currentUser = user;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    loginError.textContent = "Geen profiel/rol gevonden voor dit account. Vraag Wyno om je rol in te stellen.";
    loginError.style.display = "block";
    await supabase.auth.signOut();
    showLogin();
    return;
  }

  currentRole = profile.role;
  whoEmail.textContent = profile.email || user.email;
  whoRole.textContent = roleLabel(profile.role);

  loginScreen.style.display = "none";
  appScreen.style.display = "block";

  applyRoleVisibility(profile.role);
  await loadCustomers();
  await loadVisits();
  await loadCalls();
}

function roleLabel(role) {
  if (role === "admin") return "Directie";
  if (role === "sales") return "Verkoop (Kasia)";
  if (role === "field") return "Buitendienst (Normen)";
  return role;
}

function applyRoleVisibility(role) {
  // Field mag geen "Klanten" tab met alle klanten zien in eerste versie -
  // die tab blijft zichtbaar maar toont enkel wat RLS teruggeeft.
  // (Structuur is al voorbereid om per rol tabs te verbergen indien gewenst.)
}

loginBtn.addEventListener("click", async () => {
  loginError.style.display = "none";
  loginBtn.disabled = true;
  loginBtn.textContent = "Bezig…";
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value,
  });
  loginBtn.disabled = false;
  loginBtn.textContent = "Inloggen";

  if (error) {
    loginError.textContent = "Inloggen mislukt: " + error.message;
    loginError.style.display = "block";
    return;
  }
  await enterApp(data.user);
});

signoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

// ---------- TABS ----------
document.querySelectorAll("#tabs .tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#tabs .tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.panel).classList.add("active");
  });
});

// ---------- CUSTOMERS ----------
async function loadCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("id, kunde, kanal, abc, status, adres, postcode, plaats, telefoon, email")
    .order("kunde", { ascending: true });

  if (error) {
    document.getElementById("cust-table-wrap").innerHTML =
      `<div class="empty">Kon klanten niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  allCustomers = data || [];
  renderCustomers();
}

function renderCustomers() {
  const search = document.getElementById("cust-search").value.trim().toLowerCase();
  const status = document.getElementById("cust-status").value;

  let rows = allCustomers.filter((c) => {
    const matchesSearch =
      !search ||
      (c.kunde || "").toLowerCase().includes(search) ||
      (c.plaats || "").toLowerCase().includes(search);
    const matchesStatus = !status || c.status === status;
    return matchesSearch && matchesStatus;
  });

  document.getElementById("cust-count").textContent = `${rows.length} van ${allCustomers.length} klanten`;

  if (rows.length === 0) {
    document.getElementById("cust-table-wrap").innerHTML = `<div class="empty">Geen klanten gevonden.</div>`;
    return;
  }

  const html = `
    <table>
      <thead>
        <tr>
          <th>Klant</th><th>Kanaal</th><th>ABC</th><th>Status</th><th>Plaats</th><th>Telefoon</th><th>E-mail</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (c) => `
          <tr>
            <td>${escapeHtml(c.kunde)}</td>
            <td>${escapeHtml(c.kanal || "—")}</td>
            <td>${escapeHtml(c.abc || "—")}</td>
            <td><span class="badge ${c.status}">${statusLabel(c.status)}</span></td>
            <td>${escapeHtml(c.plaats || "—")}</td>
            <td>${escapeHtml(c.telefoon || "—")}</td>
            <td>${escapeHtml(c.email || "—")}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
  document.getElementById("cust-table-wrap").innerHTML = html;
}

function statusLabel(s) {
  if (s === "active") return "Actief";
  if (s === "lost") return "Verloren";
  if (s === "prospect") return "Prospect";
  return s || "—";
}

document.getElementById("cust-search").addEventListener("input", renderCustomers);
document.getElementById("cust-status").addEventListener("change", renderCustomers);

// ---------- VISITS ----------
async function loadVisits() {
  const { data, error } = await supabase
    .from("visit_tasks")
    .select("besuchs_id, datum, kunde, stadt, auftrag_typ, status_planung, soll_dauer_min, kommentar")
    .order("datum", { ascending: true });

  if (error) {
    document.getElementById("visit-cards").innerHTML =
      `<div class="empty">Kon bezoeken niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  allVisits = data || [];
  renderVisits();
}

function renderVisits() {
  const dateFilter = document.getElementById("visit-date").value;
  let rows = allVisits;
  if (dateFilter) {
    rows = rows.filter((v) => v.datum === dateFilter);
  }

  document.getElementById("visit-count").textContent = `${rows.length} bezoeken`;

  if (rows.length === 0) {
    document.getElementById("visit-cards").innerHTML = `<div class="empty">Geen bezoeken voor deze selectie.</div>`;
    return;
  }

  document.getElementById("visit-cards").innerHTML = rows
    .map(
      (v) => `
    <div class="visit-card">
      <span class="status">${escapeHtml(v.status_planung || "geplant")}</span>
      <h3>${escapeHtml(v.kunde)}</h3>
      <div class="meta">${escapeHtml(v.datum || "")} · ${escapeHtml(v.stadt || "")} · ${escapeHtml(v.auftrag_typ || "")} · ${v.soll_dauer_min || "?"} min</div>
      ${v.kommentar ? `<div class="meta">${escapeHtml(v.kommentar)}</div>` : ""}
    </div>`
    )
    .join("");
}

document.getElementById("visit-date").addEventListener("change", renderVisits);
document.getElementById("visit-today-btn").addEventListener("click", () => {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("visit-date").value = today;
  renderVisits();
});

// ---------- CALLS ----------
async function loadCalls() {
  const { data, error } = await supabase
    .from("phone_call_tasks")
    .select("telefon_id, geplantes_telefon_datum, zeitfenster, kunde, telefon, gespraechsziel, status")
    .order("geplantes_telefon_datum", { ascending: true });

  if (error) {
    document.getElementById("call-table-wrap").innerHTML =
      `<div class="empty">Kon telefoontaken niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  allCalls = data || [];
  renderCalls();
}

function renderCalls() {
  document.getElementById("call-count").textContent = `${allCalls.length} telefoontaken`;
  if (allCalls.length === 0) {
    document.getElementById("call-table-wrap").innerHTML = `<div class="empty">Geen telefoontaken.</div>`;
    return;
  }
  document.getElementById("call-table-wrap").innerHTML = `
    <table>
      <thead><tr><th>Datum</th><th>Tijdvak</th><th>Klant</th><th>Telefoon</th><th>Doel</th><th>Status</th></tr></thead>
      <tbody>
        ${allCalls
          .map(
            (c) => `<tr>
              <td>${escapeHtml(c.geplantes_telefon_datum || "")}</td>
              <td>${escapeHtml(c.zeitfenster || "")}</td>
              <td>${escapeHtml(c.kunde || "")}</td>
              <td>${escapeHtml(c.telefon || "—")}</td>
              <td>${escapeHtml(c.gespraechsziel || "")}</td>
              <td>${escapeHtml(c.status || "")}</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

// ---------- helpers ----------
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

init();
