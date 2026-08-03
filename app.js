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
 
