// ============================================================
// Flevosap Duitsland Agent - app.js
// ============================================================

const SUPABASE_URL = "https://iacfupckaxcnugtwioww.supabase.co";
const SUPABASE_KEY = "sb_publishable_cojow307LM2r5mBU9WzfHw_olk2vla_";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentRole = null;
let currentUser = null;
let currentLang = "nl";
let allCustomers = [];
let allVisits = [];
let allCalls = [];

// ---------- VERTALINGEN (nl / de) ----------
// Wyno, admin -> nl. Kasia (sales) en Normen (field) -> de, automatisch bij inloggen.
const I18N = {
  nl: {
    brand_title: "Flevosap · Duitsland Agent",
    login_title: "Inloggen",
    login_sub: "Toegang voor Wyno, Kasia en Normen.",
    label_email: "E-mail",
    label_password: "Wachtwoord",
    btn_inloggen: "Inloggen",
    btn_inloggen_bezig: "Bezig…",
    ingelogd_als: "Ingelogd als",
    rol_label: "rol:",
    btn_uitloggen: "Uitloggen",
    tab_acties: "Acties",
    tab_dashboard: "Dashboard",
    tab_klanten: "Klanten",
    tab_bezoeken: "Bezoeken",
    tab_kasia_bezoeken: "Mijn bezoeken",
    tab_telefoontaken: "Telefoontaken",
    filter_alle_typen: "Alle typen",
    filter_nooit_contact: "Nog nooit contact",
    filter_30plus: "Meer dan 30 dagen geleden",
    filter_alle_statussen: "Alle statussen",
    status_actief: "Actief",
    status_verloren: "Verloren",
    status_prospect: "Prospect",
    bezig_laden: "Bezig met laden…",
    zoek_naam_plaats: "Zoek op naam of plaats…",
    btn_vandaag: "Vandaag",
    week_overzicht_titel: "Weekoverzicht — daadwerkelijk bezocht (GPS)",
    btn_deze_week: "Deze week",
    kies_week: "Kies een week om te bekijken.",
    laatste_contact_titel: "Alle klanten — laatste contactmoment (meest recent bovenaan)",
    kv_filter_open: "Open",
    kv_filter_afgerond: "Afgerond",
    kv_titel: "Bezoeklijst Kasia",
    kv_toevoegen_btn: "Toevoegen aan mijn bezoeklijst",
    kv_al_toegevoegd: "Al op je bezoeklijst",
    kv_geen_items: "Nog geen klanten op je bezoeklijst.",
    kv_markeer_afgerond: "Markeer als bezocht",
    kv_reden_placeholder: "Reden (bv. geen telefonisch contact na meerdere pogingen)",
    vm_titel_default: "Bezoek",
    vm_bestand_mhd: "Bestand & MHD per product",
    vm_belegen: "Belegen",
    vm_foto: "Foto",
    vm_opmerking: "Opmerking",
    vm_opmerking_placeholder: "Eventuele opmerking over dit bezoek…",
    btn_opslaan: "Opslaan",
    btn_bezoek_afronden: "Bezoek afronden",
    btn_sluiten: "Sluiten",
    cm_titel_default: "Klant",
    cm_omzet: "Omzet 2025 (Prodin)",
    cm_gps: "GPS-bezoeken (Normen)",
    cm_contactpersonen: "Contactpersonen",
    cm_naam_placeholder: "Naam",
    cm_functie_placeholder: "Functie (bv. inkoop, filiaalleider)",
    cm_telefoon_placeholder: "Telefoon (optioneel, anders het hoofdnummer)",
    cm_persoon_toevoegen: "Contactpersoon toevoegen",
    cm_contactgeschiedenis: "Contactgeschiedenis",
    soort_telefoon: "Telefoon",
    soort_bezoek: "Bezoek",
    soort_email: "E-mail",
    soort_overig: "Overig",
    soort_demonstratie: "Demonstratie",
    cm_besproken_placeholder: "Wat is besproken?",
    cm_te_bespreken_placeholder: "Wat moet nog besproken worden (volgende keer)?",
    cm_contact_toevoegen: "Contactmoment toevoegen",
    cm_bestelgeschiedenis: "Bestelgeschiedenis",
    cm_artikel_placeholder: "Artikel",
    cm_hoeveelheid_placeholder: "Hoeveelheid (bv. 8 dozen)",
    cm_opmerking_placeholder: "Opmerking (optioneel)",
    cm_bestelling_toevoegen: "Bestelling toevoegen",
    clm_titel_default: "Telefoontaak",
    clm_status: "Status",
    clm_status_geplant: "Geplant",
    clm_status_gebeld: "Gebeld",
    clm_status_geen_gehoor: "Geen gehoor",
    clm_status_belt_terug: "Belt terug",
    clm_status_voltooid: "Voltooid",
    clm_resultaat: "Resultaat",
    clm_resultaat_placeholder: "Kort resultaat van het gesprek…",
    clm_terugbellen: "Terugbellen nodig?",
    nee: "Nee",
    ja: "Ja",
    clm_wanneer_terugbellen: "Wanneer terugbellen?",
    clm_terugbel_hint: "Wordt na opslaan automatisch toegevoegd aan de telefoonplanning.",
    clm_notitie: "Notitie",
    clm_notitie_placeholder: "Overige opmerkingen…",
    clm_geen_gehoor_hint: "Krijg je deze persoon telefonisch niet te pakken? Zet hem op je eigen bezoeklijst.",
    // Dynamische teksten (JS)
    geen_profiel: "Geen profiel/rol gevonden voor dit account. Vraag Wyno om je rol in te stellen.",
    rol_directie: "Directie",
    rol_verkoop: "Verkoop (Kasia)",
    rol_buitendienst: "Buitendienst (Normen)",
    login_mislukt: "Inloggen mislukt: ",
    klanten_van: "van",
    klanten_woord: "klanten",
    geen_klanten_gevonden: "Geen klanten gevonden.",
    kon_klanten_niet_laden: "Kon klanten niet laden: ",
    kolom_klant: "Klant",
    kolom_kanaal: "Kanaal",
    kolom_abc: "ABC",
    kolom_status: "Status",
    kolom_plaats: "Plaats",
    kolom_telefoon: "Telefoon",
    kolom_email: "E-mail",
    kolom_laatste_contact: "Laatste contact",
    tik_om_af_te_ronden: "Tik om af te ronden →",
    bezoeken_woord: "bezoeken",
    geen_bezoeken_selectie: "Geen bezoeken voor deze selectie.",
    kon_bezoeken_niet_laden: "Kon bezoeken niet laden: ",
    min_kort: "min",
    telefoontaken_woord: "telefoontaken",
    geen_telefoontaken: "Geen telefoontaken.",
    kon_telefoontaken_niet_laden: "Kon telefoontaken niet laden: ",
    kolom_datum: "Datum",
    kolom_tijdvak: "Tijdvak",
    kolom_doel: "Doel",
    nog_nooit_contact: "Nog nooit contact",
    dagen_geleden: "dagen geleden",
    klanten_aandacht: "klanten die aandacht nodig hebben",
    niets_openstaand: "Niets openstaand — goed bezig!",
    bezocht: "Bezocht",
    gebeld: "Gebeld",
    demonstratie_gegeven: "Demonstratie gegeven",
    overig_contact: "Overig contact",
    gelogd: "gelogd",
    btn_loggen: "Loggen",
    kon_actielijst_niet_laden: "Kon actielijst niet laden: ",
    fout_bij_opslaan: "Fout bij opslaan: ",
    bezig_met_opslaan: "Bezig met opslaan…",
    opgeslagen_ok: "Opgeslagen ✓",
    contactpersoon_toegevoegd: "Contactpersoon toegevoegd ✓",
    contactmoment_toegevoegd: "Contactmoment toegevoegd ✓",
    bestelling_toegevoegd: "Bestelling toegevoegd ✓",
    vul_minstens_naam: "Vul minstens een naam in.",
    vul_een_van_beide: "Vul minstens één van de twee velden in.",
    vul_artikel_of_hoeveelheid: "Vul minstens artikel of hoeveelheid in.",
    nog_geen_contactpersonen: "Nog geen contactpersonen toegevoegd.",
    verwijderen: "Verwijderen",
    nog_geen_contactmomenten: "Nog geen contactmomenten vastgelegd.",
    label_besproken: "Besproken:",
    label_nog_te_bespreken: "Nog te bespreken:",
    nog_geen_bestellingen: "Nog geen bestellingen vastgelegd.",
    label_artikel: "Artikel:",
    label_hoeveelheid: "Hoeveelheid:",
    kon_bestelgeschiedenis_niet_laden: "Kon bestelgeschiedenis niet laden: ",
    kon_contactgeschiedenis_niet_laden: "Kon contactgeschiedenis niet laden: ",
    nog_niet_gekoppeld: "Nog niet gekoppeld aan een Prodin-klantnummer.",
    zoek_bedrijfsnaam: "Zoek op bedrijfsnaam…",
    niets_gevonden: "Niets gevonden.",
    koppelen: "Koppelen",
    zoeken_mislukt: "Zoeken mislukt: ",
    gekoppeld_ok: "Gekoppeld ✓",
    koppelen_mislukt: "Koppelen mislukt: ",
    koppeling_verwijderen: "Koppeling verwijderen",
    kon_omzetdata_niet_laden: "Kon omzetdata niet laden: ",
    geen_omzetregel: "Gekoppeld aan relid",
    maar_geen_omzetregel: "maar geen omzetregel gevonden.",
    netto_omzet: "Netto omzet",
    aantal_verkocht: "Aantal verkocht",
    bruto_marge: "Bruto marge",
    jaar_2025_label: "2025 (heel jaar)",
    jaar_2026_label: "2026 (jan–sep, t.o.v. 2025)",
    trend: "Trend",
    geen_postcode: "Geen postcode bekend bij deze klant, kan niet matchen.",
    kon_gps_niet_laden: "Kon GPS-data niet laden: ",
    geen_ritregistratie: "Geen ritregistratie gevonden op postcode",
    stilgestaan: "stilgestaan",
    kon_dashboard_niet_laden: "Kon dashboard niet laden: ",
    kon_visit_niet_laden: "Kon deze telefoontaak niet laden.",
    kon_mhd_niet_laden: "Kon MHD-regels niet laden: ",
    geen_artikelregels: "Geen artikelregels voor dit bezoek.",
    flessen_placeholder: "Flessen",
    lieferschein_gecontroleerd: "Lieferschein gecontroleerd",
    nr_schein_gecontroleerd: "NR-schein gecontroleerd",
    retoure_gecontroleerd: "Retoure gecontroleerd",
    mhd_vervanging_gecontroleerd: "MHD-vervanging gecontroleerd",
    zu_prufen: "zu prüfen",
    bezoek_afgerond_ok: "Bezoek afgerond ✓",
    upload_bezig: "Bezig met uploaden…",
    upload_mislukt: "Upload mislukt: ",
    foto_geupload_ok: "Foto geüpload ✓",
    week_locaties: "bezochte locaties tussen",
    en_woord: "en",
    onbekende_locatie: "Onbekende locatie",
    stop_enkelvoud: "stop",
    stops_meervoud: "stops",
    geen_ritregistratie_week: "Geen ritregistratie gevonden voor deze week.",
    kon_week_niet_laden: "Kon weekoverzicht niet laden: ",
    kolom_klant_naam: "Klant",
    nog_nooit: "nog nooit",
    kv_reden_default: "Geen telefonisch contact gekregen",
    kv_toegevoegd_ok: "Toegevoegd aan je bezoeklijst ✓",
    kv_afgerond_ok: "Gemarkeerd als bezocht ✓",
    kv_geen_klanten: "geen klanten op je bezoeklijst",
    kon_contactpersonen_niet_laden: "Kon contactpersonen niet laden: ",
    clm_doel_label: "Doel:",
    terugbelafspraak: "Terugbelafspraak",
    terugbelafspraak_doel: "Terugbelafspraak n.a.v. vorig gesprek",
    terugbel_opslaan_mislukt: "Opgeslagen, maar terugbelafspraak inplannen mislukt: ",
  },
  de: {
    brand_title: "Flevosap · Deutschland-Agent",
    login_title: "Anmelden",
    login_sub: "Zugang für Wyno, Kasia und Normen.",
    label_email: "E-Mail",
    label_password: "Passwort",
    btn_inloggen: "Anmelden",
    btn_inloggen_bezig: "Einen Moment…",
    ingelogd_als: "Angemeldet als",
    rol_label: "Rolle:",
    btn_uitloggen: "Abmelden",
    tab_acties: "Aktionen",
    tab_dashboard: "Dashboard",
    tab_klanten: "Kunden",
    tab_bezoeken: "Besuche",
    tab_kasia_bezoeken: "Meine Besuche",
    tab_telefoontaken: "Telefonaufgaben",
    filter_alle_typen: "Alle Typen",
    filter_nooit_contact: "Noch nie kontaktiert",
    filter_30plus: "Vor mehr als 30 Tagen",
    filter_alle_statussen: "Alle Status",
    status_actief: "Aktiv",
    status_verloren: "Verloren",
    status_prospect: "Interessent",
    bezig_laden: "Wird geladen…",
    zoek_naam_plaats: "Suche nach Name oder Ort…",
    btn_vandaag: "Heute",
    week_overzicht_titel: "Wochenübersicht — tatsächlich besucht (GPS)",
    btn_deze_week: "Diese Woche",
    kies_week: "Wähle eine Woche aus.",
    laatste_contact_titel: "Alle Kunden — letzter Kontakt (neueste zuerst)",
    kv_filter_open: "Offen",
    kv_filter_afgerond: "Erledigt",
    kv_titel: "Besuchsliste Kasia",
    kv_toevoegen_btn: "Zu meiner Besuchsliste hinzufügen",
    kv_al_toegevoegd: "Bereits auf deiner Besuchsliste",
    kv_geen_items: "Noch keine Kunden auf deiner Besuchsliste.",
    kv_markeer_afgerond: "Als besucht markieren",
    kv_reden_placeholder: "Grund (z.B. telefonisch nicht erreichbar nach mehreren Versuchen)",
    vm_titel_default: "Besuch",
    vm_bestand_mhd: "Bestand & MHD pro Produkt",
    vm_belegen: "Belege",
    vm_foto: "Foto",
    vm_opmerking: "Bemerkung",
    vm_opmerking_placeholder: "Eventuelle Bemerkung zu diesem Besuch…",
    btn_opslaan: "Speichern",
    btn_bezoek_afronden: "Besuch abschließen",
    btn_sluiten: "Schließen",
    cm_titel_default: "Kunde",
    cm_omzet: "Umsatz 2025 (Prodin)",
    cm_gps: "GPS-Besuche (Normen)",
    cm_contactpersonen: "Ansprechpartner",
    cm_naam_placeholder: "Name",
    cm_functie_placeholder: "Funktion (z.B. Einkauf, Filialleiter)",
    cm_telefoon_placeholder: "Telefon (optional, sonst die Hauptnummer)",
    cm_persoon_toevoegen: "Ansprechpartner hinzufügen",
    cm_contactgeschiedenis: "Kontaktverlauf",
    soort_telefoon: "Telefon",
    soort_bezoek: "Besuch",
    soort_email: "E-Mail",
    soort_overig: "Sonstiges",
    soort_demonstratie: "Demonstration",
    cm_besproken_placeholder: "Was wurde besprochen?",
    cm_te_bespreken_placeholder: "Was muss noch besprochen werden (nächstes Mal)?",
    cm_contact_toevoegen: "Kontakt hinzufügen",
    cm_bestelgeschiedenis: "Bestellverlauf",
    cm_artikel_placeholder: "Artikel",
    cm_hoeveelheid_placeholder: "Menge (z.B. 8 Kartons)",
    cm_opmerking_placeholder: "Bemerkung (optional)",
    cm_bestelling_toevoegen: "Bestellung hinzufügen",
    clm_titel_default: "Telefonaufgabe",
    clm_status: "Status",
    clm_status_geplant: "Geplant",
    clm_status_gebeld: "Angerufen",
    clm_status_geen_gehoor: "Nicht erreicht",
    clm_status_belt_terug: "Ruft zurück",
    clm_status_voltooid: "Abgeschlossen",
    clm_resultaat: "Ergebnis",
    clm_resultaat_placeholder: "Kurzes Ergebnis des Gesprächs…",
    clm_terugbellen: "Rückruf nötig?",
    nee: "Nein",
    ja: "Ja",
    clm_wanneer_terugbellen: "Wann zurückrufen?",
    clm_terugbel_hint: "Wird nach dem Speichern automatisch zur Telefonplanung hinzugefügt.",
    clm_notitie: "Notiz",
    clm_notitie_placeholder: "Sonstige Bemerkungen…",
    clm_geen_gehoor_hint: "Erreichst du diese Person telefonisch nicht? Setze sie auf deine eigene Besuchsliste.",
    geen_profiel: "Kein Profil/Rolle für dieses Konto gefunden. Bitte Wyno bitten, deine Rolle einzurichten.",
    rol_directie: "Geschäftsführung",
    rol_verkoop: "Verkauf (Kasia)",
    rol_buitendienst: "Außendienst (Normen)",
    login_mislukt: "Anmeldung fehlgeschlagen: ",
    klanten_van: "von",
    klanten_woord: "Kunden",
    geen_klanten_gevonden: "Keine Kunden gefunden.",
    kon_klanten_niet_laden: "Kunden konnten nicht geladen werden: ",
    kolom_klant: "Kunde",
    kolom_kanaal: "Kanal",
    kolom_abc: "ABC",
    kolom_status: "Status",
    kolom_plaats: "Ort",
    kolom_telefoon: "Telefon",
    kolom_email: "E-Mail",
    kolom_laatste_contact: "Letzter Kontakt",
    tik_om_af_te_ronden: "Tippen zum Abschließen →",
    bezoeken_woord: "Besuche",
    geen_bezoeken_selectie: "Keine Besuche für diese Auswahl.",
    kon_bezoeken_niet_laden: "Besuche konnten nicht geladen werden: ",
    min_kort: "Min",
    telefoontaken_woord: "Telefonaufgaben",
    geen_telefoontaken: "Keine Telefonaufgaben.",
    kon_telefoontaken_niet_laden: "Telefonaufgaben konnten nicht geladen werden: ",
    kolom_datum: "Datum",
    kolom_tijdvak: "Zeitfenster",
    kolom_doel: "Ziel",
    nog_nooit_contact: "Noch nie kontaktiert",
    dagen_geleden: "Tage her",
    klanten_aandacht: "Kunden, die Aufmerksamkeit brauchen",
    niets_openstaand: "Nichts offen — gut gemacht!",
    bezocht: "Besucht",
    gebeld: "Angerufen",
    demonstratie_gegeven: "Demonstration gegeben",
    overig_contact: "Sonstiger Kontakt",
    gelogd: "erfasst",
    kon_actielijst_niet_laden: "Aktionsliste konnte nicht geladen werden: ",
    fout_bij_opslaan: "Fehler beim Speichern: ",
    bezig_met_opslaan: "Wird gespeichert…",
    opgeslagen_ok: "Gespeichert ✓",
    contactpersoon_toegevoegd: "Ansprechpartner hinzugefügt ✓",
    contactmoment_toegevoegd: "Kontakt hinzugefügt ✓",
    bestelling_toegevoegd: "Bestellung hinzugefügt ✓",
    vul_minstens_naam: "Bitte mindestens einen Namen eingeben.",
    vul_een_van_beide: "Bitte mindestens eines der beiden Felder ausfüllen.",
    vul_artikel_of_hoeveelheid: "Bitte mindestens Artikel oder Menge eingeben.",
    nog_geen_contactpersonen: "Noch keine Ansprechpartner hinzugefügt.",
    verwijderen: "Entfernen",
    nog_geen_contactmomenten: "Noch keine Kontakte erfasst.",
    label_besproken: "Besprochen:",
    label_nog_te_bespreken: "Noch zu besprechen:",
    nog_geen_bestellingen: "Noch keine Bestellungen erfasst.",
    label_artikel: "Artikel:",
    label_hoeveelheid: "Menge:",
    kon_bestelgeschiedenis_niet_laden: "Bestellverlauf konnte nicht geladen werden: ",
    kon_contactgeschiedenis_niet_laden: "Kontaktverlauf konnte nicht geladen werden: ",
    nog_niet_gekoppeld: "Noch nicht mit einer Prodin-Kundennummer verknüpft.",
    zoek_bedrijfsnaam: "Suche nach Firmenname…",
    niets_gevonden: "Nichts gefunden.",
    koppelen: "Verknüpfen",
    zoeken_mislukt: "Suche fehlgeschlagen: ",
    gekoppeld_ok: "Verknüpft ✓",
    koppelen_mislukt: "Verknüpfung fehlgeschlagen: ",
    koppeling_verwijderen: "Verknüpfung entfernen",
    kon_omzetdata_niet_laden: "Umsatzdaten konnten nicht geladen werden: ",
    geen_omzetregel: "Verknüpft mit Relid",
    maar_geen_omzetregel: "aber keine Umsatzzeile gefunden.",
    netto_omzet: "Nettoumsatz",
    aantal_verkocht: "Verkaufte Menge",
    bruto_marge: "Bruttomarge",
    jaar_2025_label: "2025 (ganzes Jahr)",
    jaar_2026_label: "2026 (Jan.–Sep., ggü. 2025)",
    trend: "Trend",
    geen_postcode: "Keine Postleitzahl für diesen Kunden bekannt, Abgleich nicht möglich.",
    kon_gps_niet_laden: "GPS-Daten konnten nicht geladen werden: ",
    geen_ritregistratie: "Keine Fahrtenaufzeichnung für Postleitzahl gefunden",
    stilgestaan: "Aufenthalt",
    kon_dashboard_niet_laden: "Dashboard konnte nicht geladen werden: ",
    kon_visit_niet_laden: "Diese Telefonaufgabe konnte nicht geladen werden.",
    kon_mhd_niet_laden: "MHD-Zeilen konnten nicht geladen werden: ",
    geen_artikelregels: "Keine Artikelzeilen für diesen Besuch.",
    flessen_placeholder: "Flaschen",
    lieferschein_gecontroleerd: "Lieferschein geprüft",
    nr_schein_gecontroleerd: "NR-Schein geprüft",
    retoure_gecontroleerd: "Retoure geprüft",
    mhd_vervanging_gecontroleerd: "MHD-Ersatz geprüft",
    zu_prufen: "zu prüfen",
    bezoek_afgerond_ok: "Besuch abgeschlossen ✓",
    upload_bezig: "Wird hochgeladen…",
    upload_mislukt: "Upload fehlgeschlagen: ",
    foto_geupload_ok: "Foto hochgeladen ✓",
    week_locaties: "besuchte Orte zwischen",
    en_woord: "und",
    onbekende_locatie: "Unbekannter Ort",
    stop_enkelvoud: "Stopp",
    stops_meervoud: "Stopps",
    geen_ritregistratie_week: "Keine Fahrtenaufzeichnung für diese Woche gefunden.",
    kon_week_niet_laden: "Wochenübersicht konnte nicht geladen werden: ",
    kolom_klant_naam: "Kunde",
    nog_nooit: "noch nie",
    kv_reden_default: "Telefonisch nicht erreicht",
    kv_toegevoegd_ok: "Zur Besuchsliste hinzugefügt ✓",
    kv_afgerond_ok: "Als besucht markiert ✓",
    kv_geen_klanten: "keine Kunden auf deiner Besuchsliste",
    btn_loggen: "Erfassen",
    kon_contactpersonen_niet_laden: "Ansprechpartner konnten nicht geladen werden: ",
  },
};

function t(key) {
  const dict = I18N[currentLang] || I18N.nl;
  return dict[key] !== undefined ? dict[key] : (I18N.nl[key] !== undefined ? I18N.nl[key] : key);
}

function applyStaticI18n() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
}

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
    loginError.textContent = t("geen_profiel");
    loginError.style.display = "block";
    await sb.auth.signOut();
    showLogin();
    return;
  }

  currentRole = profile.role;
  currentLang = profile.role === "admin" ? "nl" : "de";
  applyStaticI18n();

  whoEmail.textContent = profile.email || user.email;
  whoRole.textContent = roleLabel(profile.role);

  loginScreen.style.display = "none";
  appScreen.style.display = "block";

  applyRoleVisibility(profile.role);
  await loadLastContactMap();
  await loadCustomers();
  await loadVisits();
  await loadCalls();
  await loadActionsScreen();
  renderRecencyList("recency-visits-list", "recency-visits-count", allCustomers.filter((c) => c.status === "active"));
  renderRecencyList("recency-calls-list", "recency-calls-count", allCustomers.filter((c) => c.status === "active"));
  if (profile.role === "admin") {
    await loadDashboard();
  }
  if (profile.role === "admin" || profile.role === "sales") {
    await loadKasiaVisits();
  }
}

function roleLabel(role) {
  if (role === "admin") return t("rol_directie");
  if (role === "sales") return t("rol_verkoop");
  if (role === "field") return t("rol_buitendienst");
  return role;
}

function applyRoleVisibility(role) {
  if (role === "admin") {
    document.getElementById("tab-dashboard").style.display = "";
  }
  if (role === "admin" || role === "sales") {
    document.getElementById("tab-kasia-visits").style.display = "";
  }
  // Field mag geen "Klanten" tab met alle klanten zien in eerste versie -
  // die tab blijft zichtbaar maar toont enkel wat RLS teruggeeft.
  // (Structuur is al voorbereid om per rol tabs te verbergen indien gewenst.)
}

loginBtn.addEventListener("click", async () => {
  loginError.style.display = "none";
  loginBtn.disabled = true;
  loginBtn.textContent = t("btn_inloggen_bezig");
  const { data, error } = await sb.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value,
  });
  loginBtn.disabled = false;
  loginBtn.textContent = t("btn_inloggen");

  if (error) {
    loginError.textContent = t("login_mislukt") + error.message;
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
let lastContactMap = {}; // customerId -> { datum, daysSince }

const soortMap = {
  bezocht: "bezoek",
  gebeld: "telefoon",
  demonstratie: "demonstratie",
  overig: "overig",
};
function soortLabel(key) {
  if (key === "bezocht") return t("bezocht");
  if (key === "gebeld") return t("gebeld");
  if (key === "demonstratie") return t("demonstratie_gegeven");
  if (key === "overig") return t("overig_contact");
  return key;
}

async function loadLastContactMap() {
  const { data: contacts, error } = await sb
    .from("customer_contacts")
    .select("customer_id, datum")
    .order("datum", { ascending: false });

  if (error) {
    lastContactMap = {};
    return { error };
  }

  const raw = {};
  (contacts || []).forEach((c) => {
    if (!raw[c.customer_id]) raw[c.customer_id] = c.datum;
  });

  const today = new Date();
  lastContactMap = {};
  Object.keys(raw).forEach((customerId) => {
    const datum = raw[customerId];
    const daysSince = Math.floor((today - new Date(datum + "T00:00:00")) / (1000 * 60 * 60 * 24));
    lastContactMap[customerId] = { datum, daysSince };
  });
  return { error: null };
}

function contactRecencyLabel(customerId) {
  const info = lastContactMap[customerId];
  if (!info) return t("nog_nooit_contact");
  return `${info.datum} (${info.daysSince} ${t("dagen_geleden")})`;
}

// Bouwt een lijst van klanten gesorteerd op laatste contact, meest recent bovenaan.
// Klanten zonder contact komen onderaan (tegenovergestelde volgorde van de Acties-lijst).
function buildRecencySortedList(customers) {
  return [...customers]
    .map((c) => ({ customer: c, info: lastContactMap[c.id] || null }))
    .sort((a, b) => {
      if (!a.info && !b.info) return 0;
      if (!a.info) return 1;
      if (!b.info) return -1;
      return a.info.daysSince - b.info.daysSince;
    });
}

function renderRecencyList(containerId, countId, customers) {
  const rows = buildRecencySortedList(customers);
  document.getElementById(countId).textContent = `${rows.length} ${t("klanten_woord")}`;
  const el = document.getElementById(containerId);
  if (rows.length === 0) {
    el.innerHTML = `<div class="empty">${t("geen_klanten_gevonden")}</div>`;
    return;
  }
  el.innerHTML = rows
    .map(
      (r) => `
    <div class="dash-list-row">
      <span class="dl-name">${escapeHtml(r.customer.kunde)} <span class="dl-sub">${escapeHtml(r.customer.plaats || "")} · ${escapeHtml(r.customer.kanal || "—")}</span></span>
      <span>${r.info ? escapeHtml(r.info.datum) + ` <span class="dl-sub">(${r.info.daysSince}d)</span>` : `<span class="dl-sub">${t("nog_nooit")}</span>`}</span>
    </div>`
    )
    .join("");
}

async function loadActionsScreen() {
  const listEl = document.getElementById("actions-list");
  listEl.innerHTML = `<div class="empty">${t("bezig_laden")}</div>`;

  const active = allCustomers.filter((c) => c.status === "active");

  actionsData = active
    .map((c) => {
      const info = lastContactMap[c.id] || null;
      return { customer: c, lastContact: info ? info.datum : null, daysSince: info ? info.daysSince : null };
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

  document.getElementById("actions-count").textContent = `${rows.length} ${t("klanten_aandacht")}`;

  const listEl = document.getElementById("actions-list");
  if (rows.length === 0) {
    listEl.innerHTML = `<div class="empty">${t("niets_openstaand")}</div>`;
    return;
  }

  listEl.innerHTML = rows
    .map((r) => {
      const sub = r.lastContact
        ? `${t("kolom_laatste_contact")}: ${escapeHtml(r.lastContact)} (${r.daysSince} ${t("dagen_geleden")})`
        : t("nog_nooit_contact");
      return `
      <div class="action-row" data-customer-id="${escapeHtml(r.customer.id)}">
        <div class="ar-info">
          <div class="ar-name">${escapeHtml(r.customer.kunde)}</div>
          <div class="ar-sub">${escapeHtml(r.customer.plaats || "")} · ${escapeHtml(r.customer.kanal || "—")} · ${sub}</div>
        </div>
        <div class="ar-controls">
          <select class="ar-soort">
            <option value="bezocht">${t("bezocht")}</option>
            <option value="gebeld">${t("gebeld")}</option>
            <option value="demonstratie">${t("demonstratie_gegeven")}</option>
            <option value="overig">${t("overig_contact")}</option>
          </select>
          <button class="ar-log-btn">${t("btn_loggen")}</button>
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
      btn.textContent = t("bezig_met_opslaan");

      const { error } = await sb.from("customer_contacts").insert({
        customer_id: customerId,
        soort: soortMap[soortKey],
        besproken: soortLabel(soortKey),
        door: currentUser?.email || null,
      });

      if (error) {
        btn.disabled = false;
        btn.textContent = t("btn_loggen");
        alert(t("fout_bij_opslaan") + error.message);
        return;
      }

      row.querySelector(".ar-controls").innerHTML = `<span class="ar-done">✓ ${escapeHtml(soortLabel(soortKey))} ${t("gelogd")}</span>`;
      actionsData = actionsData.filter((r) => r.customer.id !== customerId);
      setTimeout(() => {
        row.remove();
        document.getElementById("actions-count").textContent = `${actionsData.length} ${t("klanten_aandacht")}`;
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
      `<div class="empty">${t("kon_klanten_niet_laden")}${escapeHtml(error.message)}</div>`;
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

  document.getElementById("cust-count").textContent = `${rows.length} ${t("klanten_van")} ${allCustomers.length} ${t("klanten_woord")}`;

  if (rows.length === 0) {
    document.getElementById("cust-table-wrap").innerHTML = `<div class="empty">${t("geen_klanten_gevonden")}</div>`;
    return;
  }

  const html = `
    <table>
      <thead>
        <tr>
          <th>${t("kolom_klant")}</th><th>${t("kolom_kanaal")}</th><th>${t("kolom_abc")}</th><th>${t("kolom_status")}</th><th>${t("kolom_plaats")}</th><th>${t("kolom_telefoon")}</th><th>${t("kolom_email")}</th><th>${t("kolom_laatste_contact")}</th>
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
            <td>${escapeHtml(contactRecencyLabel(c.id))}</td>
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
  if (s === "active") return t("status_actief");
  if (s === "lost") return t("status_verloren");
  if (s === "prospect") return t("status_prospect");
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
      `<div class="empty">${t("kon_bezoeken_niet_laden")}${escapeHtml(error.message)}</div>`;
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

  document.getElementById("visit-count").textContent = `${rows.length} ${t("bezoeken_woord")}`;

  if (rows.length === 0) {
    document.getElementById("visit-cards").innerHTML = `<div class="empty">${t("geen_bezoeken_selectie")}</div>`;
    return;
  }

  document.getElementById("visit-cards").innerHTML = rows
    .map(
      (v) => `
    <div class="visit-card" data-besuchs-id="${escapeHtml(v.besuchs_id)}">
      <span class="status">${escapeHtml(v.status_planung || "geplant")}</span>
      <h3>${escapeHtml(v.kunde)}</h3>
      <div class="meta">${escapeHtml(v.datum || "")} · ${escapeHtml(v.stadt || "")} · ${escapeHtml(v.auftrag_typ || "")} · ${v.soll_dauer_min || "?"} ${t("min_kort")}</div>
      ${v.kommentar ? `<div class="meta">${escapeHtml(v.kommentar)}</div>` : ""}
      <div class="meta" style="margin-top:6px; font-weight:600; color:var(--moss-dark);">${t("tik_om_af_te_ronden")}</div>
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
  resultsEl.innerHTML = `<div class="empty">${t("bezig_laden")}</div>`;

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
    resultsEl.innerHTML = `<div class="empty">${t("kon_week_niet_laden")}${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    countEl.textContent = "";
    resultsEl.innerHTML = `<div class="empty">${t("geen_ritregistratie_week")}</div>`;
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
          const naam = customer ? customer.kunde : `${t("onbekende_locatie")}${g.land ? " (" + g.land + ")" : ""}`;
          const tijdRange = g.tijden.length > 1 ? `${g.tijden[0]} – ${g.tijden[g.tijden.length - 1]}` : g.tijden[0];
          const stopWoord = g.tijden.length === 1 ? t("stop_enkelvoud") : t("stops_meervoud");
          return `
          <div class="week-visit-row ${customer ? "" : "wv-unmatched"}">
            <span>${escapeHtml(naam)}${!customer ? ` <span class="wv-time">(${escapeHtml(g.adres_raw)})</span>` : ""}</span>
            <span class="wv-time">${escapeHtml(tijdRange)} · ${g.tijden.length} ${stopWoord}</span>
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

  countEl.textContent = `${totaalLocaties} ${t("week_locaties")} ${startDateStr} ${t("en_woord")} ${endDateStr}`;
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
      `<div class="empty">${t("kon_telefoontaken_niet_laden")}${escapeHtml(error.message)}</div>`;
    return;
  }
  allCalls = data || [];
  renderCalls();
}

function renderCalls() {
  document.getElementById("call-count").textContent = `${allCalls.length} ${t("telefoontaken_woord")}`;
  if (allCalls.length === 0) {
    document.getElementById("call-table-wrap").innerHTML = `<div class="empty">${t("geen_telefoontaken")}</div>`;
    return;
  }
  document.getElementById("call-table-wrap").innerHTML = `
    <table>
      <thead><tr><th>${t("kolom_datum")}</th><th>${t("kolom_tijdvak")}</th><th>${t("kolom_klant_naam")}</th><th>${t("kolom_telefoon")}</th><th>${t("kolom_doel")}</th><th>${t("kolom_status")}</th></tr></thead>
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
  el.innerHTML = `<div class="empty">${t("bezig_laden")}</div>`;

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
  vmMhdList.innerHTML = `<div class="empty">${t("bezig_laden")}</div>`;
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
    vmMhdList.innerHTML = `<div class="empty">${t("kon_mhd_niet_laden")}${escapeHtml(mhdErr.message)}</div>`;
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
    vmMhdList.innerHTML = `<div class="empty">${t("geen_artikelregels")}</div>`;
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
      <input type="number" min="0" placeholder="${t("flessen_placeholder")}" value="${r.bestand_flaschen ?? ""}" data-field="bestand_flaschen">
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
    <div class="doc-row"><span>${t("lieferschein_gecontroleerd")}</span>${yesNo("lieferschein_pruefen", d.lieferschein_pruefen)}</div>
    <div class="doc-row"><span>${t("nr_schein_gecontroleerd")}</span>${yesNo("nr_schein_pruefen", d.nr_schein_pruefen)}</div>
    <div class="doc-row"><span>${t("retoure_gecontroleerd")}</span>${yesNo("retoure_pruefen", d.retoure_pruefen)}</div>
    <div class="doc-row"><span>${t("mhd_vervanging_gecontroleerd")}</span>${yesNo("mhd_ersatz_pruefen", d.mhd_ersatz_pruefen)}</div>
  `;
}

document.getElementById("vm-save-btn").addEventListener("click", () => saveVisitDetail(false));
document.getElementById("vm-complete-btn").addEventListener("click", () => saveVisitDetail(true));

async function saveVisitDetail(markComplete) {
  vmSaveStatus.textContent = t("bezig_met_opslaan");
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
      vmSaveStatus.textContent = t("bezoek_afgerond_ok");
      vmSaveStatus.className = "vm-hint ok";
      await loadVisits();
      setTimeout(closeVisitModal, 900);
    } else {
      vmSaveStatus.textContent = t("opgeslagen_ok");
      vmSaveStatus.className = "vm-hint ok";
    }
  } catch (err) {
    vmSaveStatus.textContent = t("fout_bij_opslaan") + err.message;
    vmSaveStatus.className = "vm-hint err";
  }
}

vmPhotoInput.addEventListener("change", async () => {
  const file = vmPhotoInput.files[0];
  if (!file || !vmBesuchsId) return;

  vmPhotoStatus.textContent = t("upload_bezig");
  const path = `${vmBesuchsId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await sb.storage.from("visit-photos").upload(path, file);
  if (uploadError) {
    vmPhotoStatus.textContent = t("upload_mislukt") + uploadError.message;
    return;
  }

  // Koppel het bestandspad aan de eerste MHD-regel van dit bezoek (indien aanwezig)
  if (vmMhdRows[0]) {
    await sb.from("mhd_records").update({ foto_datei: path }).eq("mhd_id", vmMhdRows[0].mhd_id);
  }
  vmPhotoStatus.textContent = t("foto_geupload_ok");
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
  cmContactsList.innerHTML = `<div class="empty">${t("bezig_laden")}</div>`;
  cmOrdersList.innerHTML = `<div class="empty">${t("bezig_laden")}</div>`;
  document.getElementById("cm-contact-besproken").value = "";
  document.getElementById("cm-contact-te-bespreken").value = "";
  document.getElementById("cm-order-artikel").value = "";
  document.getElementById("cm-order-hoeveelheid").value = "";
  document.getElementById("cm-order-opmerking").value = "";
  customerModal.classList.add("open");

  const customer = allCustomers.find((c) => c.id === customerId);
  cmTitle.textContent = customer ? customer.kunde : t("cm_titel_default");
  cmMeta.innerHTML = customer
    ? `${escapeHtml(customer.adres || "")}, ${escapeHtml(customer.postcode || "")} ${escapeHtml(customer.plaats || "")}<br>
       ${escapeHtml(customer.telefoon || "—")} · ${escapeHtml(customer.email || "—")} · ${t("kolom_kanaal")}: ${escapeHtml(customer.kanal || "—")} · ${t("kolom_abc")}: ${escapeHtml(customer.abc || "—")}`
    : "";

  await Promise.all([
    loadSalesSection(customer),
    loadGpsSection(customer),
    loadContactPersons(customerId),
    loadCustomerContacts(customerId),
    loadCustomerOrders(customerId),
    loadKasiaVisitSectionForCustomer(customer),
  ]);
}

async function loadGpsSection(customer) {
  const el = document.getElementById("cm-gps-section");
  if (!customer || !customer.postcode) {
    el.innerHTML = `<div class="empty">${t("geen_postcode")}</div>`;
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
    el.innerHTML = `<div class="empty">${t("kon_gps_niet_laden")}${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty">${t("geen_ritregistratie")} ${escapeHtml(cleanPostcode)}.</div>`;
    return;
  }
  el.innerHTML = data
    .map(
      (s) => `
    <div class="history-item">
      <div class="h-date">${escapeHtml(s.datum)} · ${escapeHtml(s.start_tijd)} – ${escapeHtml(s.eind_tijd)} (${escapeHtml(s.stoptijd)} ${t("stilgestaan")})</div>
      <div class="h-line">${escapeHtml(s.adres_raw)}</div>
    </div>`
    )
    .join("");
}

async function loadSalesSection(customer) {
  const el = document.getElementById("cm-sales-section");
  if (!customer || !customer.linked_prodin_relid) {
    el.innerHTML = `
      <div class="empty" style="padding:10px 0;">${t("nog_niet_gekoppeld")}</div>
      <input type="text" id="cm-prodin-search" placeholder="${t("zoek_bedrijfsnaam")}">
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
        resultsEl.innerHTML = `<div class="empty">${t("zoeken_mislukt")}${escapeHtml(error.message)}</div>`;
        return;
      }
      if (!data || data.length === 0) {
        resultsEl.innerHTML = `<div class="empty">${t("niets_gevonden")}</div>`;
        return;
      }
      resultsEl.innerHTML = data
        .map(
          (p) => `
        <div class="sales-search-result">
          <span>${escapeHtml(p.name1)} · ${escapeHtml(p.visitadrcity || "")} (relid ${p.relid})</span>
          <button data-link-relid="${p.relid}">${t("koppelen")}</button>
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
            cmSaveStatus.textContent = t("koppelen_mislukt") + linkErr.message;
            cmSaveStatus.className = "vm-hint err";
            return;
          }
          const c = allCustomers.find((x) => x.id === cmCustomerId);
          if (c) c.linked_prodin_relid = relid;
          cmSaveStatus.textContent = t("gekoppeld_ok");
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
    el.innerHTML = `<div class="empty">${t("kon_omzetdata_niet_laden")}${escapeHtml((err25 || err26).message)}</div>`;
    return;
  }
  const data25 = rows25 && rows25[0];
  const data26 = rows26 && rows26[0];

  if (!data25 && !data26) {
    el.innerHTML = `<div class="empty">${t("geen_omzetregel")} ${customer.linked_prodin_relid}, ${t("maar_geen_omzetregel")}</div>
      <button class="sales-unlink" id="cm-unlink-btn">${t("koppeling_verwijderen")}</button>`;
  } else {
    let html = "";
    if (data25) {
      html += `
        <div class="fig-year-label">${t("jaar_2025_label")}</div>
        <div class="sales-figures">
          <div class="fig"><div class="fig-val">€${data25.netto_omzet.toFixed(0)}</div><div class="fig-label">${t("netto_omzet")}</div></div>
          <div class="fig"><div class="fig-val">${data25.aantal}</div><div class="fig-label">${t("aantal_verkocht")}</div></div>
          <div class="fig"><div class="fig-val">${data25.bruto_marge_pct.toFixed(1)}%</div><div class="fig-label">${t("bruto_marge")}</div></div>
        </div>`;
    }
    if (data26) {
      const diff = data26.netto_omzet_2025 ? (((data26.netto_omzet_2026 - data26.netto_omzet_2025) / Math.abs(data26.netto_omzet_2025)) * 100) : null;
      const diffLabel = diff === null ? "" : `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}%`;
      html += `
        <div class="fig-year-label" style="margin-top:10px;">${t("jaar_2026_label")}</div>
        <div class="sales-figures">
          <div class="fig"><div class="fig-val">€${data26.netto_omzet_2026.toFixed(0)}</div><div class="fig-label">${t("netto_omzet")}</div></div>
          <div class="fig"><div class="fig-val">${data26.aantal_2026}</div><div class="fig-label">${t("aantal_verkocht")}</div></div>
          <div class="fig"><div class="fig-val" style="color:${diff >= 0 ? 'var(--ok)' : 'var(--danger)'};">${diffLabel}</div><div class="fig-label">${t("trend")}</div></div>
        </div>`;
    }
    html += `<button class="sales-unlink" id="cm-unlink-btn">${t("koppeling_verwijderen")}</button>`;
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
    list.innerHTML = `<div class="empty">${t("kon_contactpersonen_niet_laden")}${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = `<div class="empty">${t("nog_geen_contactpersonen")}</div>`;
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
      <button class="p-remove" data-remove-person="${p.id}">${t("verwijderen")}</button>
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
    cmSaveStatus.textContent = t("vul_minstens_naam");
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  cmSaveStatus.textContent = t("bezig_met_opslaan");
  cmSaveStatus.className = "vm-hint";

  const { error } = await sb.from("contact_persons").insert({
    customer_id: cmCustomerId,
    naam,
    functie: functie || null,
    telefoon: telefoon || null,
  });

  if (error) {
    cmSaveStatus.textContent = t("fout_bij_opslaan") + error.message;
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  document.getElementById("cm-person-naam").value = "";
  document.getElementById("cm-person-functie").value = "";
  document.getElementById("cm-person-telefoon").value = "";
  cmSaveStatus.textContent = t("contactpersoon_toegevoegd");
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
    cmContactsList.innerHTML = `<div class="empty">${t("kon_contactgeschiedenis_niet_laden")}${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    cmContactsList.innerHTML = `<div class="empty">${t("nog_geen_contactmomenten")}</div>`;
    return;
  }
  cmContactsList.innerHTML = data
    .map(
      (r) => `
    <div class="history-item">
      <div class="h-date">${escapeHtml(r.datum)} · ${escapeHtml(r.soort)}${r.door ? " · " + escapeHtml(r.door) : ""}</div>
      ${r.besproken ? `<div class="h-line"><span class="h-label">${t("label_besproken")}</span> ${escapeHtml(r.besproken)}</div>` : ""}
      ${r.te_bespreken ? `<div class="h-line"><span class="h-label">${t("label_nog_te_bespreken")}</span> ${escapeHtml(r.te_bespreken)}</div>` : ""}
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
    cmOrdersList.innerHTML = `<div class="empty">${t("kon_bestelgeschiedenis_niet_laden")}${escapeHtml(error.message)}</div>`;
    return;
  }
  if (!data || data.length === 0) {
    cmOrdersList.innerHTML = `<div class="empty">${t("nog_geen_bestellingen")}</div>`;
    return;
  }
  cmOrdersList.innerHTML = data
    .map(
      (r) => `
    <div class="history-item">
      <div class="h-date">${escapeHtml(r.datum)}${r.door ? " · " + escapeHtml(r.door) : ""}</div>
      <div class="h-line"><span class="h-label">${t("label_artikel")}</span> ${escapeHtml(r.artikel || "—")} · <span class="h-label">${t("label_hoeveelheid")}</span> ${escapeHtml(r.hoeveelheid || "—")}</div>
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
    cmSaveStatus.textContent = t("vul_een_van_beide");
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  cmSaveStatus.textContent = t("bezig_met_opslaan");
  cmSaveStatus.className = "vm-hint";

  const { error } = await sb.from("customer_contacts").insert({
    customer_id: cmCustomerId,
    soort,
    besproken: besproken || null,
    te_bespreken: teBespreken || null,
    door: currentUser?.email || null,
  });

  if (error) {
    cmSaveStatus.textContent = t("fout_bij_opslaan") + error.message;
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  document.getElementById("cm-contact-besproken").value = "";
  document.getElementById("cm-contact-te-bespreken").value = "";
  cmSaveStatus.textContent = t("contactmoment_toegevoegd");
  cmSaveStatus.className = "vm-hint ok";
  await loadCustomerContacts(cmCustomerId);
});

document.getElementById("cm-order-add-btn").addEventListener("click", async () => {
  const artikel = document.getElementById("cm-order-artikel").value.trim();
  const hoeveelheid = document.getElementById("cm-order-hoeveelheid").value.trim();
  const opmerking = document.getElementById("cm-order-opmerking").value.trim();

  if (!artikel && !hoeveelheid) {
    cmSaveStatus.textContent = t("vul_artikel_of_hoeveelheid");
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  cmSaveStatus.textContent = t("bezig_met_opslaan");
  cmSaveStatus.className = "vm-hint";

  const { error } = await sb.from("orders").insert({
    customer_id: cmCustomerId,
    artikel: artikel || null,
    hoeveelheid: hoeveelheid || null,
    opmerking: opmerking || null,
    door: currentUser?.email || null,
  });

  if (error) {
    cmSaveStatus.textContent = t("fout_bij_opslaan") + error.message;
    cmSaveStatus.className = "vm-hint err";
    return;
  }

  document.getElementById("cm-order-artikel").value = "";
  document.getElementById("cm-order-hoeveelheid").value = "";
  document.getElementById("cm-order-opmerking").value = "";
  cmSaveStatus.textContent = t("bestelling_toegevoegd");
  cmSaveStatus.className = "vm-hint ok";
  await loadCustomerOrders(cmCustomerId);
});

// ---------- TELEFOONTAAK MODAL ----------
let clmTelefonId = null;
let clmCurrentCall = null;

const callModal = document.getElementById("call-modal");
const clmTitle = document.getElementById("clm-title");
const clmMeta = document.getElementById("clm-meta");
const clmStatus = document.getElementById("clm-status");
const clmErgebnis = document.getElementById("clm-ergebnis");
const clmRueckruf = document.getElementById("clm-rueckruf");
const clmNotiz = document.getElementById("clm-notiz");
const clmSaveStatus = document.getElementById("clm-save-status");
const clmCallbackFields = document.getElementById("clm-callback-fields");
const clmCallbackDatum = document.getElementById("clm-callback-datum");
const clmCallbackTijd = document.getElementById("clm-callback-tijd");

document.getElementById("clm-close").addEventListener("click", closeCallModal);
document.getElementById("clm-close-btn").addEventListener("click", closeCallModal);
callModal.addEventListener("click", (e) => {
  if (e.target === callModal) closeCallModal();
});

clmRueckruf.addEventListener("change", () => {
  clmCallbackFields.style.display = clmRueckruf.value === "ja" ? "block" : "none";
});

function closeCallModal() {
  callModal.classList.remove("open");
  clmTelefonId = null;
  clmCurrentCall = null;
}

async function openCallModal(telefonId) {
  clmTelefonId = telefonId;
  clmSaveStatus.textContent = "";
  clmCallbackDatum.value = "";
  clmCallbackTijd.value = "";
  clmCallbackFields.style.display = "none";
  callModal.classList.add("open");

  const { data: call, error } = await sb
    .from("phone_call_tasks")
    .select("*")
    .eq("telefon_id", telefonId)
    .single();

  if (error || !call) {
    clmMeta.textContent = t("kon_visit_niet_laden");
    return;
  }

  clmCurrentCall = call;
  clmTitle.textContent = call.kunde || telefonId;
  clmMeta.innerHTML = `${escapeHtml(call.geplantes_telefon_datum || "")} · ${escapeHtml(call.zeitfenster || "")} · ${escapeHtml(call.telefon || "—")}<br>
    ${t("clm_doel_label")} ${escapeHtml(call.gespraechsziel || "—")}`;

  clmStatus.value = call.status || "geplant";
  clmErgebnis.value = call.ergebnis_kurz || "";
  clmRueckruf.value = call.rueckruf_erforderlich || "nein";
  clmNotiz.value = call.notiz || "";
  clmCallbackFields.style.display = clmRueckruf.value === "ja" ? "block" : "none";

  await renderKasiaVisitQuickAdd("clm-add-kasia-visit-btn", call.kunde, findCustomerIdByName(call.kunde));
}

document.getElementById("clm-save-btn").addEventListener("click", async () => {
  clmSaveStatus.textContent = t("bezig_met_opslaan");
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
    clmSaveStatus.textContent = t("fout_bij_opslaan") + error.message;
    clmSaveStatus.className = "vm-hint err";
    return;
  }

  // Terugbelafspraak inplannen als nieuwe telefoontaak
  if (clmRueckruf.value === "ja" && clmCallbackDatum.value && clmCallbackTijd.value && clmCurrentCall) {
    const newId = "RB-" + Date.now();
    const { error: cbError } = await sb.from("phone_call_tasks").insert({
      telefon_id: newId,
      geplantes_telefon_datum: clmCallbackDatum.value,
      zeitfenster: clmCallbackTijd.value,
      kunde: clmCurrentCall.kunde,
      telefon: clmCurrentCall.telefon,
      email: clmCurrentCall.email,
      kanal: clmCurrentCall.kanal,
      abc: clmCurrentCall.abc,
      ansprechpartner: clmCurrentCall.ansprechpartner,
      auftrag_typ: t("terugbelafspraak"),
      gespraechsziel: t("terugbelafspraak_doel"),
      dauer_min: 10,
      status: "geplant",
    });
    if (cbError) {
      clmSaveStatus.textContent = t("terugbel_opslaan_mislukt") + cbError.message;
      clmSaveStatus.className = "vm-hint err";
      await loadCalls();
      return;
    }
  }

  clmSaveStatus.textContent = t("opgeslagen_ok");
  clmSaveStatus.className = "vm-hint ok";
  await loadCalls();
  setTimeout(closeCallModal, 700);
});

// ---------- KASIA'S EIGEN BEZOEKLIJST ----------
let allKasiaVisits = [];

function findCustomerIdByName(kunde) {
  if (!kunde) return null;
  const match = allCustomers.find((c) => c.kunde === kunde);
  return match ? match.id : null;
}

async function loadKasiaVisits() {
  const { data, error } = await sb
    .from("kasia_visits")
    .select("*, customers(kunde, plaats, kanal, telefoon)")
    .order("toegevoegd_op", { ascending: false });

  if (error) {
    allKasiaVisits = [];
    const el = document.getElementById("kasia-visits-list");
    if (el) el.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
    return;
  }
  allKasiaVisits = data || [];
  renderKasiaVisitsList();
}

function renderKasiaVisitsList() {
  const filter = document.getElementById("kasia-visit-status-filter");
  if (!filter) return;
  const status = filter.value;
  let rows = allKasiaVisits;
  if (status) rows = rows.filter((r) => r.status === status);

  document.getElementById("kasia-visits-count").textContent = `${rows.length}`;
  const el = document.getElementById("kasia-visits-list");

  if (rows.length === 0) {
    el.innerHTML = `<div class="empty">${t("kv_geen_items")}</div>`;
    return;
  }

  el.innerHTML = rows
    .map((r) => {
      const c = r.customers || {};
      const done = r.status === "afgerond";
      return `
      <div class="action-row" data-kv-id="${r.id}">
        <div class="ar-info">
          <div class="ar-name">${escapeHtml(c.kunde || "—")}</div>
          <div class="ar-sub">${escapeHtml(c.plaats || "")} · ${escapeHtml(c.kanal || "—")} · ${escapeHtml(r.reden || "")}</div>
        </div>
        <div class="ar-controls">
          ${done ? `<span class="ar-done">✓ ${t("kv_filter_afgerond")}</span>` : `<button class="kv-complete-btn">${t("kv_markeer_afgerond")}</button>`}
        </div>
      </div>`;
    })
    .join("");

  el.querySelectorAll(".kv-complete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest(".action-row");
      const id = row.dataset.kvId;
      btn.disabled = true;
      const { error } = await sb
        .from("kasia_visits")
        .update({ status: "afgerond", afgerond_op: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        alert(t("fout_bij_opslaan") + error.message);
        btn.disabled = false;
        return;
      }
      await loadKasiaVisits();
    });
  });
}

const kvStatusFilterEl = document.getElementById("kasia-visit-status-filter");
if (kvStatusFilterEl) kvStatusFilterEl.addEventListener("change", renderKasiaVisitsList);

async function addToKasiaVisits(customerId, reden) {
  const { error } = await sb.from("kasia_visits").insert({
    customer_id: customerId,
    reden: reden || t("kv_reden_default"),
    toegevoegd_door: currentUser?.email || null,
    status: "open",
  });
  return { error };
}

// Sectie in de klantenkaart
async function loadKasiaVisitSectionForCustomer(customer) {
  const el = document.getElementById("cm-kasia-visit-section");
  if (!el) return;
  if (!customer) {
    el.innerHTML = "";
    return;
  }
  if (!(currentRole === "admin" || currentRole === "sales")) {
    el.innerHTML = "";
    return;
  }

  const { data, error } = await sb
    .from("kasia_visits")
    .select("*")
    .eq("customer_id", customer.id)
    .order("toegevoegd_op", { ascending: false });

  if (error) {
    el.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
    return;
  }

  const openItem = (data || []).find((r) => r.status !== "afgerond");

  if (openItem) {
    el.innerHTML = `<div class="empty" style="padding:8px 0;">${t("kv_al_toegevoegd")} — ${escapeHtml(openItem.reden || "")}</div>`;
    return;
  }

  el.innerHTML = `
    <div class="add-form">
      <input type="text" id="cm-kv-reden" placeholder="${t("kv_reden_placeholder")}">
      <button class="secondary" id="cm-kv-add-btn">${t("kv_toevoegen_btn")}</button>
    </div>`;

  document.getElementById("cm-kv-add-btn").addEventListener("click", async () => {
    const reden = document.getElementById("cm-kv-reden").value.trim();
    const { error: addErr } = await addToKasiaVisits(customer.id, reden);
    if (addErr) {
      cmSaveStatus.textContent = t("fout_bij_opslaan") + addErr.message;
      cmSaveStatus.className = "vm-hint err";
      return;
    }
    cmSaveStatus.textContent = t("kv_toegevoegd_ok");
    cmSaveStatus.className = "vm-hint ok";
    await loadKasiaVisitSectionForCustomer(customer);
    await loadKasiaVisits();
  });
}

// Quick-add knop in de telefoontaak-modal
async function renderKasiaVisitQuickAdd(buttonId, kunde, customerId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  if (!(currentRole === "admin" || currentRole === "sales") || !customerId) {
    btn.style.display = "none";
    return;
  }
  btn.style.display = "";
  btn.disabled = false;
  btn.textContent = t("kv_toevoegen_btn");
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = t("bezig_met_opslaan");
    const { error } = await addToKasiaVisits(customerId, t("kv_reden_default"));
    if (error) {
      alert(t("fout_bij_opslaan") + error.message);
      btn.disabled = false;
      btn.textContent = t("kv_toevoegen_btn");
      return;
    }
    btn.textContent = "✓ " + t("kv_toegevoegd_ok");
    await loadKasiaVisits();
  };
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
