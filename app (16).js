// ============================================================
// Flevosap Duitsland Agent - app.js
// ============================================================

const SUPABASE_URL = "https://iacfupckaxcnugtwioww.supabase.co";
const SUPABASE_KEY = "sb_publishable_cojow307LM2r5mBU9WzfHw_olk2vla_";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  const { data: { session } } = await sb.auth.getSession();
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
  const { data: profile, error } = await sb
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    loginError.textContent = "Geen profiel/rol gevonden voor dit account. Vraag Wyno om je rol in te stellen.";
    loginError.style.display = "block";
    await sb.auth.signOut();
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
  await loadActionsScreen();
  if (profile.role === "admin") {
    await loadDashboard();
  }
}

function roleLabel(role) {
  if (role === "admin") return "Directie";
  if (role === "sales") return "Verkoop (Kasia)";
  if (role === "field") return "Buitendienst (Normen)";
  return role;
}

function applyRoleVisibility(role) {
  if (role === "admin") {
    document.getElementById("tab-dashboard").style.display = "";
  }
  // Field mag geen "Klanten" tab met alle klanten zien in eerste versie -
  // die tab blijft zichtbaar maar toont enkel wat RLS teruggeeft.
  // (Structuur is al voorbereid om per rol tabs te verbergen indien gewenst.)
}

loginBtn.addEventListener("click", async () => {
  loginError.style.display = "none";
  loginBtn.disabled = true;
  loginBtn.textContent = "Bezig…";
  const { data, error } = await sb.auth.signInWithPassword({
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
  await sb.auth.signOut();
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

// ---------- ACTIES (gedeeld startscherm voor iedereen) ----------
let actionsData = [];

const soortMap = {
  bezocht: "bezoek",
  gebeld: "telefoon",
  demonstratie: "demonstratie",
  overig: "overig",
};
const soortLabels = {
  bezocht: "Bezocht",
  gebeld: "Gebeld",
  demonstratie: "Demonstratie gegeven",
  overig: "Overig contact",
};

async function loadActionsScreen() {
  const listEl = document.getElementById("actions-list");
  listEl.innerHTML = `<div class="empty">Bezig met laden…</div>`;

  const { data: contacts, error } = await sb
    .from("customer_contacts")
    .select("customer_id, datum")
    .order("datum", { ascending: false });

  if (error) {
    listEl.innerHTML = `<div class="empty">Kon actielijst niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }

  const lastContact = {};
  (contacts || []).forEach((c) => {
    if (!lastContact[c.customer_id]) lastContact[c.customer_id] = c.datum;
  });

  const today = new Date();
  const active = allCustomers.filter((c) => c.status === "active");

  actionsData = active
    .map((c) => {
      const last = lastContact[c.id] || null;
      let daysSince = null;
      if (last) {
        daysSince = Math.floor((today - new Date(last + "T00:00:00")) / (1000 * 60 * 60 * 24));
      }
      return { customer: c, lastContact: last, daysSince };
    })
    .filter((r) => r.lastContact === null || r.daysSince > 30)
    .sort((a, b) => {
      if (a.lastContact === null && b.lastContact !== null) return -1;
      if (a.lastContact !== null && b.lastContact === null) return 1;
      return (b.daysSince || 0) - (a.daysSince || 0);
    });

  renderActionsList();
}

function renderActionsList() {
  const filter = document.getElementById("actions-soort-filter").value;
  let rows = actionsData;
  if (filter === "nooit") rows = rows.filter((r) => r.lastContact === null);
  if (filter === "30plus") rows = rows.filter((r) => r.lastContact !== null);

  document.getElementById("actions-count").textContent = `${rows.length} klanten die aandacht nodig hebben`;

  const listEl = document.getElementById("actions-list");
  if (rows.length === 0) {
    listEl.innerHTML = `<div class="empty">Niets openstaand — goed bezig!</div>`;
    return;
  }

  listEl.innerHTML = rows
    .map((r) => {
      const sub = r.lastContact
        ? `Laatste contact: ${escapeHtml(r.lastContact)} (${r.daysSince} dagen geleden)`
        : `Nog nooit contact vastgelegd`;
      return `
      <div class="action-row" data-customer-id="${escapeHtml(r.customer.id)}">
        <div class="ar-info">
          <div class="ar-name">${escapeHtml(r.customer.kunde)}</div>
          <div class="ar-sub">${escapeHtml(r.customer.plaats || "")} · ${escapeHtml(r.customer.kanal || "—")} · ${sub}</div>
        </div>
        <div class="ar-controls">
          <select class="ar-soort">
            <option value="bezocht">Bezocht</option>
            <option value="gebeld">Gebeld</option>
            <option value="demonstratie">Demonstratie gegeven</option>
            <option value="overig">Overig contact</option>
          </select>
          <button class="ar-log-btn">Loggen</button>
        </div>
      </div>`;
    })
    .join("");

  listEl.querySelectorAll(".action-row").forEach((row) => {
    row.querySelector(".ar-log-btn").addEventListener("click", async () => {
      const customerId = row.dataset.customerId;
      const soortKey = row.querySelector(".ar-soort").value;
      const btn = row.querySelector(".ar-log-btn");
      btn.disabled = true;
      btn.textContent = "Bezig…";

      const { error } = await sb.from("customer_contacts").insert({
        customer_id: customerId,
        soort: soortMap[soortKey],
        besproken: soortLabels[soortKey],
        door: currentUser?.email || null,
      });

      if (error) {
        btn.disabled = false;
        btn.textContent = "Loggen";
        alert("Opslaan mislukt: " + error.message);
        return;
      }

      row.querySelector(".ar-controls").innerHTML = `<span class="ar-done">✓ ${escapeHtml(soortLabels[soortKey])} gelogd</span>`;
      actionsData = actionsData.filter((r) => r.customer.id !== customerId);
      setTimeout(() => {
        row.remove();
        document.getElementById("actions-count").textContent = `${actionsData.length} klanten die aandacht nodig hebben`;
      }, 900);
    });
  });
}

document.getElementById("actions-soort-filter").addEventListener("change", renderActionsList);

// ---------- CUSTOMERS ----------
async function loadCustomers() {
  const { data, error } = await sb
    .from("customers")
    .select("id, kunde, kanal, abc, status, adres, postcode, plaats, telefoon, email, ansprechpartner, linked_prodin_relid")
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
          <tr class="customer-row" data-customer-id="${escapeHtml(c.id)}">
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

  document.querySelectorAll("#cust-table-wrap tr.customer-row").forEach((row) => {
    row.addEventListener("click", () => openCustomerModal(row.dataset.customerId));
  });
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
  const { data, error } = await sb
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
    <div class="visit-card" data-besuchs-id="${escapeHtml(v.besuchs_id)}">
      <span class="status">${escapeHtml(v.status_planung || "geplant")}</span>
      <h3>${escapeHtml(v.kunde)}</h3>
      <div class="meta">${escapeHtml(v.datum || "")} · ${escapeHtml(v.stadt || "")} · ${escapeHtml(v.auftrag_typ || "")} · ${v.soll_dauer_min || "?"} min</div>
      ${v.kommentar ? `<div class="meta">${escapeHtml(v.kommentar)}</div>` : ""}
      <div class="meta" style="margin-top:6px; font-weight:600; color:var(--moss-dark);">Tik om af te ronden →</div>
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

// ---------- WEEKOVERZICHT (GPS-bezoeken) ----------
function mondayOf(dateStr) {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const day = d.getDay(); // 0 = zondag
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

document.getElementById("week-this-btn").addEventListener("click", () => {
  const monday = fmtDate(mondayOf(null));
  document.getElementById("week-start-date").value = monday;
  loadWeekOverview(monday);
});

document.getElementById("week-start-date").addEventListener("change", (e) => {
  const monday = fmtDate(mondayOf(e.target.value));
  e.target.value = monday;
  loadWeekOverview(monday);
});

async function loadWeekOverview(startDateStr) {
  const resultsEl = document.getElementById("week-results");
  const countEl = document.getElementById("week-count");
  resultsEl.innerHTML = `<div class="empty">Bezig met laden…</div>`;

  const start = new Date(startDateStr + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endDateStr = fmtDate(end);

  const { data, error } = await sb
    .from("normen_stops")
    .select("datum, start_tijd, postcode, land, adres_raw")
    .gte("datum", startDateStr)
    .lte("datum", endDateStr)
    .order("datum", { ascending: true })
    .order("start_tijd", { ascending: true });

  if (error) {
    resultsEl.innerHTML = `<div class="empty">Kon weekoverzicht niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    countEl.textContent = "";
    resultsEl.innerHTML = `<div class="empty">Geen ritregistratie gevonden voor deze week.</div>`;
    return;
  }

  // Groepeer per dag, en binnen elke dag per postcode (dedupe opeenvolgende stops op dezelfde locatie)
  const postcodeToCustomer = {};
  allCustomers.forEach((c) => {
    if (c.postcode) postcodeToCustomer[c.postcode.replace(/\s/g, "")] = c;
  });

  const byDay = {};
  data.forEach((s) => {
    if (!byDay[s.datum]) byDay[s.datum] = {};
    const key = (s.postcode || s.adres_raw || "onbekend").replace(/\s/g, "");
    if (!byDay[s.datum][key]) {
      byDay[s.datum][key] = { postcode: s.postcode, adres_raw: s.adres_raw, land: s.land, tijden: [] };
    }
    byDay[s.datum][key].tijden.push(s.start_tijd);
  });

  let totaalLocaties = 0;
  const days = Object.keys(byDay).sort();
  const html = days
    .map((datum) => {
      const groups = Object.values(byDay[datum]);
      totaalLocaties += groups.length;
      const rows = groups
        .map((g) => {
          const customer = g.postcode ? postcodeToCustomer[g.postcode.replace(/\s/g, "")] : null;
          const naam = customer ? customer.kunde : `Onbekende locatie${g.land ? " (" + g.land + ")" : ""}`;
          const tijdRange = g.tijden.length > 1 ? `${g.tijden[0]} – ${g.tijden[g.tijden.length - 1]}` : g.tijden[0];
          return `
          <div class="week-visit-row ${customer ? "" : "wv-unmatched"}">
            <span>${escapeHtml(naam)}${!customer ? ` <span class="wv-time">(${escapeHtml(g.adres_raw)})</span>` : ""}</span>
            <span class="wv-time">${escapeHtml(tijdRange)} · ${g.tijden.length} stop(s)</span>
          </div>`;
        })
        .join("");
      return `
      <div class="week-day-group">
        <div class="wd-date">${escapeHtml(datum)}</div>
        ${rows}
      </div>`;
    })
    .join("");

  countEl.textContent = `${totaalLocaties} bezochte locaties tussen ${startDateStr} en ${endDateStr}`;
  resultsEl.innerHTML = html;
}

// ---------- CALLS ----------
async function loadCalls() {
  const { data, error } = await sb
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
            (c) => `<tr class="customer-row" data-telefon-id="${escapeHtml(c.telefon_id)}">
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

  document.querySelectorAll("#call-table-wrap tr.customer-row").forEach((row) => {
    row.addEventListener("click", () => openCallModal(row.dataset.telefonId));
  });
}

// ---------- DASHBOARD (directie) ----------
async function loadDashboard() {
  const el = document.getElementById("dash-content");
  el.innerHTML = `<div class="empty">Bezig met laden…</div>`;

  const [salesRes, tripsRes, visitsRes, callsRes, stopsRes] = await Promise.all([
    sb.from("sales_2026").select("relid, naam, plaats, netto_omzet_2025, netto_omzet_2026"),
    sb.from("normen_trips_daily").select("datum, km_totaal"),
    sb.from("visit_tasks").select("status_planung"),
    sb.from("phone_call_tasks").select("status"),
    sb.from("normen_stops").select("postcode").eq("land", "Duitsland"),
  ]);

  if (salesRes.error) {
    el.innerHTML = `<div class="empty">Kon dashboard niet laden: ${escapeHtml(salesRes.error.message)}</div>`;
    return;
  }

  const sales = salesRes.data || [];
  const trips = tripsRes.data || [];
  const visits = visitsRes.data || [];
  const calls = callsRes.data || [];
  const stops = stopsRes.data || [];

  // --- GPS-dekking: hoeveel bezochte postcodes komen overeen met bekende klanten ---
  const knownPostcodes = new Set(allCustomers.map((c) => (c.postcode || "").replace(/\s/g, "")).filter(Boolean));
  const stopPostcodes = stops.map((s) => (s.postcode || "").replace(/\s/g, "")).filter(Boolean);
  const uniqueStopPostcodes = new Set(stopPostcodes);
  const matchedPostcodes = [...uniqueStopPostcodes].filter((p) => knownPostcodes.has(p));
  const gpsMatchPct = uniqueStopPostcodes.size ? Math.round((matchedPostcodes.length / uniqueStopPostcodes.size) * 100) : 0;

  // --- Omzet totaal 2025 vs 2026 ---
  const totaal2025 = sales.reduce((s, r) => s + (r.netto_omzet_2025 || 0), 0);
  const totaal2026 = sales.reduce((s, r) => s + (r.netto_omzet_2026 || 0), 0);
  const trendPct = totaal2025 ? ((totaal2026 - totaal2025) / totaal2025) * 100 : null;
  const trendClass = trendPct >= 0 ? "dash-trend-up" : "dash-trend-down";
  const trendSign = trendPct >= 0 ? "+" : "";

  // --- Topklanten 2026 ---
  const top5 = [...sales].sort((a, b) => (b.netto_omzet_2026 || 0) - (a.netto_omzet_2026 || 0)).slice(0, 5);

  // --- Klanten met dalende omzet ---
  const dalers = sales
    .filter((r) => (r.netto_omzet_2025 || 0) > 50 && (r.netto_omzet_2026 || 0) < (r.netto_omzet_2025 || 0))
    .map((r) => ({ ...r, daling_pct: ((r.netto_omzet_2026 - r.netto_omzet_2025) / r.netto_omzet_2025) * 100 }))
    .sort((a, b) => a.daling_pct - b.daling_pct)
    .slice(0, 5);

  // --- Normen: kilometers ---
  const kmTotaal = trips.reduce((s, t) => s + (t.km_totaal || 0), 0);
  const dagenGereden = trips.length;
  const kmGemiddeld = dagenGereden ? kmTotaal / dagenGereden : 0;

  // --- Bezoeken voortgang ---
  const bezoekenTotaal = visits.length;
  const bezoekenAfgerond = visits.filter((v) => v.status_planung === "erledigt").length;
  const bezoekenPct = bezoekenTotaal ? Math.round((bezoekenAfgerond / bezoekenTotaal) * 100) : 0;

  // --- Telefoontaken open ---
  const callsOpen = calls.filter((c) => !["voltooid", "gebeld"].includes(c.status)).length;

  el.innerHTML = `
    <div class="dash-grid">
      <div class="dash-card">
        <h3>Omzet 2026 (jan–sep)</h3>
        <div class="dash-big">€${totaal2026.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}</div>
        <div class="dash-sub ${trendClass}">${trendPct === null ? "—" : trendSign + trendPct.toFixed(0) + "%"} t.o.v. 2025 (€${totaal2025.toLocaleString("nl-NL", { maximumFractionDigits: 0 })})</div>
      </div>
      <div class="dash-card">
        <h3>Km Normen (2026 YTD)</h3>
        <div class="dash-big">${kmTotaal.toLocaleString("nl-NL", { maximumFractionDigits: 0 })} km</div>
        <div class="dash-sub">${dagenGereden} rijdagen · gem. ${kmGemiddeld.toFixed(0)} km/dag</div>
      </div>
      <div class="dash-card">
        <h3>Bezoeken afgerond</h3>
        <div class="dash-big">${bezoekenPct}%</div>
        <div class="dash-sub">${bezoekenAfgerond} van ${bezoekenTotaal} geplande bezoeken</div>
      </div>
      <div class="dash-card">
        <h3>Open telefoontaken</h3>
        <div class="dash-big">${callsOpen}</div>
        <div class="dash-sub">nog te bellen / af te handelen</div>
      </div>
      <div class="dash-card">
        <h3>GPS-dekking Normen</h3>
        <div class="dash-big">${gpsMatchPct}%</div>
        <div class="dash-sub">${matchedPostcodes.length} van ${uniqueStopPostcodes.size} bezochte postcodes herkend als klant</div>
      </div>
    </div>

    <div class="dash-grid" style="grid-template-columns:1fr 1fr;">
      <div class="dash-card">
        <div class="dash-section-title">Topklanten 2026</div>
        ${top5
          .map(
            (r) => `
          <div class="dash-list-row">
            <span class="dl-name">${escapeHtml(r.naam)} <span class="dl-sub">${escapeHtml(r.plaats || "")}</span></span>
            <span>€${(r.netto_omzet_2026 || 0).toLocaleString("nl-NL", { maximumFractionDigits: 0 })}</span>
          </div>`
          )
          .join("") || `<div class="empty">Geen data.</div>`}
      </div>
      <div class="dash-card">
        <div class="dash-section-title">Klanten met dalende omzet</div>
        ${dalers
          .map(
            (r) => `
          <div class="dash-list-row">
            <span class="dl-name">${escapeHtml(r.naam)} <span class="dl-sub">${escapeHtml(r.plaats || "")}</span></span>
            <span class="dash-trend-down">${r.daling_pct.toFixed(0)}%</span>
          </div>`
          )
          .join("") || `<div class="empty">Geen opvallende dalers.</div>`}
      </div>
    </div>
  `;
}

// ---------- VISIT DETAIL MODAL (bezoek afronden) ----------
let vmBesuchsId = null;
let vmMhdRows = [];
let vmDocRow = null;

const visitModal = document.getElementById("visit-modal");
const vmTitle = document.getElementById("vm-title");
const vmMeta = document.getElementById("vm-meta");
const vmMhdList = document.getElementById("vm-mhd-list");
const vmDocs = document.getElementById("vm-docs");
const vmNotitie = document.getElementById("vm-notitie");
const vmPhotoInput = document.getElementById("vm-photo-input");
const vmPhotoStatus = document.getElementById("vm-photo-status");
const vmSaveStatus = document.getElementById("vm-save-status");

document.getElementById("vm-close").addEventListener("click", closeVisitModal);
visitModal.addEventListener("click", (e) => {
  if (e.target === visitModal) closeVisitModal();
});

function closeVisitModal() {
  visitModal.classList.remove("open");
  vmBesuchsId = null;
}

async function openVisitModal(besuchsId) {
  vmBesuchsId = besuchsId;
  vmSaveStatus.textContent = "";
  vmPhotoStatus.textContent = "";
  vmNotitie.value = "";
  vmMhdList.innerHTML = `<div class="empty">Bezig met laden…</div>`;
  vmDocs.innerHTML = "";
  visitModal.classList.add("open");

  const visit = allVisits.find((v) => v.besuchs_id === besuchsId);
  vmTitle.textContent = visit ? visit.kunde : besuchsId;
  vmMeta.textContent = visit
    ? `${visit.datum || ""} · ${visit.stadt || ""} · ${visit.auftrag_typ || ""}`
    : "";

  const [{ data: mhd, error: mhdErr }, { data: docs, error: docErr }] = await Promise.all([
    sb.from("mhd_records").select("*").eq("besuchs_id", besuchsId),
    sb.from("document_records").select("*").eq("besuchs_id", besuchsId).maybeSingle(),
  ]);

  if (mhdErr) {
    vmMhdList.innerHTML = `<div class="empty">Kon MHD-regels niet laden: ${escapeHtml(mhdErr.message)}</div>`;
  } else {
    vmMhdRows = mhd || [];
    renderMhdRows();
  }

  vmDocRow = docErr ? null : docs;
  renderDocRow();
  vmNotitie.value = (vmMhdRows[0] && vmMhdRows[0].notiz) || "";
}

function renderMhdRows() {
  if (vmMhdRows.length === 0) {
    vmMhdList.innerHTML = `<div class="empty">Geen artikelregels voor dit bezoek.</div>`;
    return;
  }
  vmMhdList.innerHTML = vmMhdRows
    .map(
      (r, i) => `
    <div class="mhd-row" data-idx="${i}">
      <div>
        <div class="mhd-name">${escapeHtml(r.produkt)}</div>
        <div class="mhd-sub">${escapeHtml(r.gebinde || "")}</div>
      </div>
      <input type="number" min="0" placeholder="Flessen" value="${r.bestand_flaschen ?? ""}" data-field="bestand_flaschen">
      <select data-field="mhd_risiko">
        ${["offen", "ok", "kurz", "kritisch", "abgelaufen"]
          .map((opt) => `<option value="${opt}" ${r.mhd_risiko === opt ? "selected" : ""}>${opt}</option>`)
          .join("")}
      </select>
    </div>`
    )
    .join("");
}

function renderDocRow() {
  const d = vmDocRow || {};
  const yesNo = (field, current) => `
    <select data-field="${field}">
      ${["ja", "nein", "zu prüfen"]
        .map((opt) => `<option value="${opt}" ${current === opt ? "selected" : ""}>${opt}</option>`)
        .join("")}
    </select>`;

  vmDocs.innerHTML = `
    <div class="doc-row"><span>Lieferschein gecontroleerd</span>${yesNo("lieferschein_pruefen", d.lieferschein_pruefen)}</div>
    <div class="doc-row"><span>NR-schein gecontroleerd</span>${yesNo("nr_schein_pruefen", d.nr_schein_pruefen)}</div>
    <div class="doc-row"><span>Retoure gecontroleerd</span>${yesNo("retoure_pruefen", d.retoure_pruefen)}</div>
    <div class="doc-row"><span>MHD-vervanging gecontroleerd</span>${yesNo("mhd_ersatz_pruefen", d.mhd_ersatz_pruefen)}</div>
  `;
}

document.getElementById("vm-save-btn").addEventListener("click", () => saveVisitDetail(false));
document.getElementById("vm-complete-btn").addEventListener("click", () => saveVisitDetail(true));

async function saveVisitDetail(markComplete) {
  vmSaveStatus.textContent = "Bezig met opslaan…";
  vmSaveStatus.className = "vm-hint";

  try {
    // MHD-regels bijwerken
    const mhdInputs = vmMhdList.querySelectorAll(".mhd-row");
    for (const rowEl of mhdInputs) {
      const idx = Number(rowEl.dataset.idx);
      const row = vmMhdRows[idx];
      const bestand = rowEl.querySelector('[data-field="bestand_flaschen"]').value;
      const risiko = rowEl.querySelector('[data-field="mhd_risiko"]').value;
      const { error } = await sb
        .from("mhd_records")
        .update({
          bestand_flaschen: bestand === "" ? null : Number(bestand),
          mhd_risiko: risiko,
          notiz: vmNotitie.value || null,
        })
        .eq("mhd_id", row.mhd_id);
      if (error) throw error;
    }

    // Belegen bijwerken (indien er een rij bestaat voor dit bezoek)
    const docFields = {};
    vmDocs.querySelectorAll("select[data-field]").forEach((sel) => {
      docFields[sel.dataset.field] = sel.value;
    });
    if (vmDocRow) {
      const { error } = await sb
        .from("document_records")
        .update(docFields)
        .eq("beleg_id", vmDocRow.beleg_id);
      if (error) throw error;
    }

    // Protocol log
    await sb.from("protocol_log").insert({
      akteur: currentUser?.email || "onbekend",
      entitaet: "visit_tasks",
      entitaets_id: vmBesuchsId,
      aktion: markComplete ? "bezoek afgerond" : "bezoek bijgewerkt",
      quelle: "Duitsland Agent app",
    });

    if (markComplete) {
      const { error } = await sb
        .from("visit_tasks")
        .update({ status_planung: "erledigt" })
        .eq("besuchs_id", vmBesuchsId);
      if (error) throw error;
      vmSaveStatus.textContent = "Bezoek afgerond ✓";
      vmSaveStatus.className = "vm-hint ok";
      await loadVisits();
      setTimeout(closeVisitModal, 900);
    } else {
      vmSaveStatus.textContent = "Opgeslagen ✓";
      vmSaveStatus.className = "vm-hint ok";
    }
  } catch (err) {
    vmSaveStatus.textContent = "Fout bij opslaan: " + err.message;
    vmSaveStatus.className = "vm-hint err";
  }
}

vmPhotoInput.addEventListener("change", async () => {
  const file = vmPhotoInput.files[0];
  if (!file || !vmBesuchsId) return;

  vmPhotoStatus.textContent = "Bezig met uploaden…";
  const path = `${vmBesuchsId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await sb.storage.from("visit-photos").upload(path, file);
  if (uploadError) {
    vmPhotoStatus.textContent = "Upload mislukt: " + uploadError.message;
    return;
  }

  // Koppel het bestandspad aan de eerste MHD-regel van dit bezoek (indien aanwezig)
  if (vmMhdRows[0]) {
    await sb.from("mhd_records").update({ foto_datei: path }).eq("mhd_id", vmMhdRows[0].mhd_id);
  }
  vmPhotoStatus.textContent = "Foto geüpload ✓";
});

// Bezoekkaarten klikbaar maken om het formulier te openen
document.getElementById("visit-cards").addEventListener("click", (e) => {
  const card = e.target.closest(".visit-card");
  if (card && card.dataset.besuchsId) {
    openVisitModal(card.dataset.besuchsId);
  }
});

// ---------- KLANTENKAART MODAL ----------
let cmCustomerId = null;

const customerModal = document.getElementById("customer-modal");
const cmTitle = document.getElementById("cm-title");
const cmMeta = document.getElementById("cm-meta");
const cmContactsList = document.getElementById("cm-contacts-list");
const cmOrdersList = document.getElementById("cm-orders-list");
const cmSaveStatus = document.getElementById("cm-save-status");

document.getElementById("cm-close").addEventListener("click", closeCustomerModal);
document.getElementById("cm-close-btn").addEventListener("click", closeCustomerModal);
customerModal.addEventListener("click", (e) => {
  if (e.target === customerModal) closeCustomerModal();
});

function closeCustomerModal() {
  customerModal.classList.remove("open");
  cmCustomerId = null;
}

async function openCustomerModal(customerId) {
  cmCustomerId = customerId;
  cmSaveStatus.textContent = "";
  cmContactsList.innerHTML = `<div class="empty">Bezig met laden…</div>`;
  cmOrdersList.innerHTML = `<div class="empty">Bezig met laden…</div>`;
  document.getElementById("cm-contact-besproken").value = "";
  document.getElementById("cm-contact-te-bespreken").value = "";
  document.getElementById("cm-order-artikel").value = "";
  document.getElementById("cm-order-hoeveelheid").value = "";
  document.getElementById("cm-order-opmerking").value = "";
  customerModal.classList.add("open");

  const customer = allCustomers.find((c) => c.id === customerId);
  cmTitle.textContent = customer ? customer.kunde : "Klant";
  cmMeta.innerHTML = customer
    ? `${escapeHtml(customer.adres || "")}, ${escapeHtml(customer.postcode || "")} ${escapeHtml(customer.plaats || "")}<br>
       ${escapeHtml(customer.telefoon || "—")} · ${escapeHtml(customer.email || "—")} · Kanaal: ${escapeHtml(customer.kanal || "—")} · ABC: ${escapeHtml(customer.abc || "—")}`
    : "";

  await Promise.all([
    loadSalesSection(customer),
    loadGpsSection(customer),
    loadContactPersons(customerId),
    loadCustomerContacts(customerId),
    loadCustomerOrders(customerId),
  ]);
}

async function loadGpsSection(customer) {
  const el = document.getElementById("cm-gps-section");
  if (!customer || !customer.postcode) {
    el.innerHTML = `<div class="empty">Geen postcode bekend bij deze klant, kan niet matchen.</div>`;
    return;
  }
  const cleanPostcode = customer.postcode.replace(/\s/g, "");
  const { data, error } = await sb
    .from("normen_stops")
    .select("datum, start_tijd, eind_tijd, stoptijd, adres_raw")
    .eq("postcode", cleanPostcode)
    .order("datum", { ascending: false })
    .limit(10);

  if (error) {
    el.innerHTML = `<div class="empty">Kon GPS-data niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty">Geen ritregistratie gevonden op postcode ${escapeHtml(cleanPostcode)}.</div>`;
    return;
  }
  el.innerHTML = data
    .map(
      (s) => `
    <div class="history-item">
      <div class="h-date">${escapeHtml(s.datum)} · ${escapeHtml(s.start_tijd)} – ${escapeHtml(s.eind_tijd)} (${escapeHtml(s.stoptijd)} stilgestaan)</div>
      <div class="h-line">${escapeHtml(s.adres_raw)}</div>
    </div>`
    )
    .join("");
}

async function loadSalesSection(customer) {
  const el = document.getElementById("cm-sales-section");
  if (!customer || !customer.linked_prodin_relid) {
    el.innerHTML = `
      <div class="empty" style="padding:10px 0;">Nog niet gekoppeld aan een Prodin-klantnummer.</div>
      <input type="text" id="cm-prodin-search" placeholder="Zoek op bedrijfsnaam…">
      <div id="cm-prodin-results"></div>`;
    document.getElementById("cm-prodin-search").addEventListener("keyup", async (e) => {
      if (e.key !== "Enter") return;
      const q = e.target.value.trim();
      if (!q) return;
      const { data, error } = await sb
        .from("customers_prodin")
        .select("relid, name1, name3, visitadrcity")
        .ilike("name1", `%${q}%`)
        .limit(8);
      const resultsEl = document.getElementById("cm-prodin-results");
      if (error) {
        resultsEl.innerHTML = `<div class="empty">Zoeken mislukt: ${escapeHtml(error.message)}</div>`;
        return;
      }
      if (!data || data.length === 0) {
        resultsEl.innerHTML = `<div class="empty">Niets gevonden.</div>`;
        return;
      }
      resultsEl.innerHTML = data
        .map(
          (p) => `
        <div class="sales-search-result">
          <span>${escapeHtml(p.name1)} · ${escapeHtml(p.visitadrcity || "")} (relid ${p.relid})</span>
          <button data-link-relid="${p.relid}">Koppelen</button>
        </div>`
        )
        .join("");
      resultsEl.querySelectorAll("[data-link-relid]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const relid = Number(btn.dataset.linkRelid);
          const { error: linkErr } = await sb
            .from("customers")
            .update({ linked_prodin_relid: relid })
            .eq("id", cmCustomerId);
          if (linkErr) {
            cmSaveStatus.textContent = "Koppelen mislukt: " + linkErr.message;
            cmSaveStatus.className = "vm-hint err";
            return;
          }
          const c = allCustomers.find((x) => x.id === cmCustomerId);
          if (c) c.linked_prodin_relid = relid;
          cmSaveStatus.textContent = "Gekoppeld ✓";
          cmSaveStatus.className = "vm-hint ok";
          await loadSalesSection(c);
        });
      });
    });
    return;
  }

  const [{ data: rows25, error: err25 }, { data: rows26, error: err26 }] = await Promise.all([
    sb.from("sales_2025").select("*").eq("relid", customer.linked_prodin_relid).order("id", { ascending: true }).limit(1),
    sb.from("sales_2026").select("*").eq("relid", customer.linked_prodin_relid).order("id", { ascending: true }).limit(1),
  ]);

  if (err25 || err26) {
    el.innerHTML = `<div class="empty">Kon omzetdata niet laden: ${escapeHtml((err25 || err26).message)}</div>`;
    return;
  }
  const data25 = rows25 && rows25[0];
  const data26 = rows26 && rows26[0];

  if (!data25 && !data26) {
    el.innerHTML = `<div class="empty">Gekoppeld aan relid ${customer.linked_prodin_relid}, maar geen omzetregel gevonden.</div>
      <button class="sales-unlink" id="cm-unlink-btn">Koppeling verwijderen</button>`;
  } else {
    let html = "";
    if (data25) {
      html += `
        <div class="fig-year-label">2025 (heel jaar)</div>
        <div class="sales-figures">
          <div class="fig"><div class="fig-val">€${data25.netto_omzet.toFixed(0)}</div><div class="fig-label">Netto omzet</div></div>
          <div class="fig"><div class="fig-val">${data25.aantal}</div><div class="fig-label">Aantal verkocht</div></div>
          <div class="fig"><div class="fig-val">${data25.bruto_marge_pct.toFixed(1)}%</div><div class="fig-label">Bruto marge</div></div>
        </div>`;
    }
    if (data26) {
      const diff = data26.netto_omzet_2025 ? (((data26.netto_omzet_2026 - data26.netto_omzet_2025) / Math.abs(data26.netto_omzet_2025)) * 100) : null;
      const diffLabel = diff === null ? "" : `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}% t.o.v. 2025`;
      html += `
        <div class="fig-year-label" style="margin-top:10px;">2026 (jan–sep, t.o.v. 2025)</div>
        <div class="sales-figures">
          <div class="fig"><div class="fig-val">€${data26.netto_omzet_2026.toFixed(0)}</div><div class="fig-label">Netto omzet</div></div>
          <div class="fig"><div class="fig-val">${data26.aantal_2026}</div><div class="fig-label">Aantal verkocht</div></div>
          <div class="fig"><div class="fig-val" style="color:${diff >= 0 ? 'var(--ok)' : 'var(--danger)'};">${diffLabel}</div><div class="fig-label">Trend</div></div>
        </div>`;
    }
    html += `<button class="sales-unlink" id="cm-unlink-btn">Koppeling verwijderen</button>`;
    el.innerHTML = html;
  }

  document.getElementById("cm-unlink-btn").addEventListener("click", async () => {
    await sb.from("customers").update({ linked_prodin_relid: null }).eq("id", cmCustomerId);
    const c = allCustomers.find((x) => x.id === cmCustomerId);
    if (c) c.linked_prodin_relid = null;
    await loadSalesSection(c);
  });
}

async function loadContactPersons(customerId) {
  const list = document.getElementById("cm-people-list");
  const { data, error } = await sb
    .from("contact_persons")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true });

  if (error) {
    list.innerHTML = `<div class="empty">Kon contactpersonen niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = `<div class="empty">Nog geen contactpersonen toegevoegd.</div>`;
    return;
  }
  list.innerHTML = data
    .map(
      (p) => `
    <div class="person-row" data-person-id="${p.id}">
      <div>
        <div class="p-name">${escapeHtml(p.naam)}</div>
        <div class="p-sub">${[p.functie, p.telefoon, p.email].filter(Boolean).map(escapeHtml).join(" · ") || "—"}</div>
      </div>
      <button class="p-remove" data-remove-person="${p.id}">Verwijderen</button>
    </div>`
    )
    .join("");

  list.querySelectorAll("[data-remove-person]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await sb.from("contact_persons").delete().eq("id", btn.dataset.removePerson);
      await loadContactPersons(customerId);
    });
  });
}

document.getElementById("cm-person-add-btn").addEventListener("click", async () => {
  const naam = document.getElementById("cm-person-naam").value.trim();
  const functie = document.getElementById("cm-person-functie").value.trim();
  const telefoon = document.getElementById("cm-person-telefoon").value.trim();

  if (!naam) {
    cmSaveStatus.textContent = "Vul minstens een naam in.";
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  cmSaveStatus.textContent = "Bezig met opslaan…";
  cmSaveStatus.className = "vm-hint";

  const { error } = await sb.from("contact_persons").insert({
    customer_id: cmCustomerId,
    naam,
    functie: functie || null,
    telefoon: telefoon || null,
  });

  if (error) {
    cmSaveStatus.textContent = "Fout bij opslaan: " + error.message;
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  document.getElementById("cm-person-naam").value = "";
  document.getElementById("cm-person-functie").value = "";
  document.getElementById("cm-person-telefoon").value = "";
  cmSaveStatus.textContent = "Contactpersoon toegevoegd ✓";
  cmSaveStatus.className = "vm-hint ok";
  await loadContactPersons(cmCustomerId);
});

async function loadCustomerContacts(customerId) {
  const { data, error } = await sb
    .from("customer_contacts")
    .select("*")
    .eq("customer_id", customerId)
    .order("datum", { ascending: false });

  if (error) {
    cmContactsList.innerHTML = `<div class="empty">Kon contactgeschiedenis niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    cmContactsList.innerHTML = `<div class="empty">Nog geen contactmomenten vastgelegd.</div>`;
    return;
  }
  cmContactsList.innerHTML = data
    .map(
      (r) => `
    <div class="history-item">
      <div class="h-date">${escapeHtml(r.datum)} · ${escapeHtml(r.soort)}${r.door ? " · " + escapeHtml(r.door) : ""}</div>
      ${r.besproken ? `<div class="h-line"><span class="h-label">Besproken:</span> ${escapeHtml(r.besproken)}</div>` : ""}
      ${r.te_bespreken ? `<div class="h-line"><span class="h-label">Nog te bespreken:</span> ${escapeHtml(r.te_bespreken)}</div>` : ""}
    </div>`
    )
    .join("");
}

async function loadCustomerOrders(customerId) {
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("datum", { ascending: false });

  if (error) {
    cmOrdersList.innerHTML = `<div class="empty">Kon bestelgeschiedenis niet laden: ${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    cmOrdersList.innerHTML = `<div class="empty">Nog geen bestellingen vastgelegd.</div>`;
    return;
  }
  cmOrdersList.innerHTML = data
    .map(
      (r) => `
    <div class="history-item">
      <div class="h-date">${escapeHtml(r.datum)}${r.door ? " · " + escapeHtml(r.door) : ""}</div>
      <div class="h-line"><span class="h-label">Artikel:</span> ${escapeHtml(r.artikel || "—")} · <span class="h-label">Hoeveelheid:</span> ${escapeHtml(r.hoeveelheid || "—")}</div>
      ${r.opmerking ? `<div class="h-line">${escapeHtml(r.opmerking)}</div>` : ""}
    </div>`
    )
    .join("");
}

document.getElementById("cm-contact-add-btn").addEventListener("click", async () => {
  const soort = document.getElementById("cm-contact-soort").value;
  const besproken = document.getElementById("cm-contact-besproken").value.trim();
  const teBespreken = document.getElementById("cm-contact-te-bespreken").value.trim();

  if (!besproken && !teBespreken) {
    cmSaveStatus.textContent = "Vul minstens één van de twee velden in.";
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  cmSaveStatus.textContent = "Bezig met opslaan…";
  cmSaveStatus.className = "vm-hint";

  const { error } = await sb.from("customer_contacts").insert({
    customer_id: cmCustomerId,
    soort,
    besproken: besproken || null,
    te_bespreken: teBespreken || null,
    door: currentUser?.email || null,
  });

  if (error) {
    cmSaveStatus.textContent = "Fout bij opslaan: " + error.message;
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  document.getElementById("cm-contact-besproken").value = "";
  document.getElementById("cm-contact-te-bespreken").value = "";
  cmSaveStatus.textContent = "Contactmoment toegevoegd ✓";
  cmSaveStatus.className = "vm-hint ok";
  await loadCustomerContacts(cmCustomerId);
});

document.getElementById("cm-order-add-btn").addEventListener("click", async () => {
  const artikel = document.getElementById("cm-order-artikel").value.trim();
  const hoeveelheid = document.getElementById("cm-order-hoeveelheid").value.trim();
  const opmerking = document.getElementById("cm-order-opmerking").value.trim();

  if (!artikel && !hoeveelheid) {
    cmSaveStatus.textContent = "Vul minstens artikel of hoeveelheid in.";
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  cmSaveStatus.textContent = "Bezig met opslaan…";
  cmSaveStatus.className = "vm-hint";

  const { error } = await sb.from("orders").insert({
    customer_id: cmCustomerId,
    artikel: artikel || null,
    hoeveelheid: hoeveelheid || null,
    opmerking: opmerking || null,
    door: currentUser?.email || null,
  });

  if (error) {
    cmSaveStatus.textContent = "Fout bij opslaan: " + error.message;
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  document.getElementById("cm-order-artikel").value = "";
  document.getElementById("cm-order-hoeveelheid").value = "";
  document.getElementById("cm-order-opmerking").value = "";
  cmSaveStatus.textContent = "Bestelling toegevoegd ✓";
  cmSaveStatus.className = "vm-hint ok";
  await loadCustomerOrders(cmCustomerId);
});

// ---------- TELEFOONTAAK MODAL ----------
let clmTelefonId = null;

const callModal = document.getElementById("call-modal");
const clmTitle = document.getElementById("clm-title");
const clmMeta = document.getElementById("clm-meta");
const clmStatus = document.getElementById("clm-status");
const clmErgebnis = document.getElementById("clm-ergebnis");
const clmRueckruf = document.getElementById("clm-rueckruf");
const clmNotiz = document.getElementById("clm-notiz");
const clmSaveStatus = document.getElementById("clm-save-status");

document.getElementById("clm-close").addEventListener("click", closeCallModal);
document.getElementById("clm-close-btn").addEventListener("click", closeCallModal);
callModal.addEventListener("click", (e) => {
  if (e.target === callModal) closeCallModal();
});

function closeCallModal() {
  callModal.classList.remove("open");
  clmTelefonId = null;
}

async function openCallModal(telefonId) {
  clmTelefonId = telefonId;
  clmSaveStatus.textContent = "";
  callModal.classList.add("open");

  const { data: call, error } = await sb
    .from("phone_call_tasks")
    .select("*")
    .eq("telefon_id", telefonId)
    .single();

  if (error || !call) {
    clmMeta.textContent = "Kon deze telefoontaak niet laden.";
    return;
  }

  clmTitle.textContent = call.kunde || telefonId;
  clmMeta.innerHTML = `${escapeHtml(call.geplantes_telefon_datum || "")} · ${escapeHtml(call.zeitfenster || "")} · ${escapeHtml(call.telefon || "—")}<br>
    Doel: ${escapeHtml(call.gespraechsziel || "—")}`;

  clmStatus.value = call.status || "geplant";
  clmErgebnis.value = call.ergebnis_kurz || "";
  clmRueckruf.value = call.rueckruf_erforderlich || "nein";
  clmNotiz.value = call.notiz || "";
}

document.getElementById("clm-save-btn").addEventListener("click", async () => {
  clmSaveStatus.textContent = "Bezig met opslaan…";
  clmSaveStatus.className = "vm-hint";

  const { error } = await sb
    .from("phone_call_tasks")
    .update({
      status: clmStatus.value,
      ergebnis_kurz: clmErgebnis.value || null,
      rueckruf_erforderlich: clmRueckruf.value,
      notiz: clmNotiz.value || null,
    })
    .eq("telefon_id", clmTelefonId);

  if (error) {
    clmSaveStatus.textContent = "Fout bij opslaan: " + error.message;
    clmSaveStatus.className = "vm-hint err";
    return;
  }

  clmSaveStatus.textContent = "Opgeslagen ✓";
  clmSaveStatus.className = "vm-hint ok";
  await loadCalls();
  setTimeout(closeCallModal, 700);
});

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
