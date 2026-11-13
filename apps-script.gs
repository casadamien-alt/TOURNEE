// Ma tournée — stockage privé dans votre Google Drive (à coller dans script.google.com)
const CODE_SECRET = "CHANGEZ-MOI";   // ← remplacez par votre code secret
const NOM_FICHIER = "ma-tournee-donnees.json";
const DOSSIER_RECUS = "Ma tournée – reçus";   // dossier des photos de reçus de carburant

function fichier_() {
  const it = DriveApp.getFilesByName(NOM_FICHIER);
  return it.hasNext() ? it.next() : DriveApp.createFile(NOM_FICHIER, "{}", "application/json");
}
function lire_() { try { return JSON.parse(fichier_().getBlob().getDataAsString() || "{}"); } catch (e) { return {}; } }
function dossierRecus_() {
  const it = DriveApp.getFoldersByName(DOSSIER_RECUS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DOSSIER_RECUS);
}
function repondre_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  if ((e.parameter.code || "") !== CODE_SECRET) return repondre_({ ok: false, erreur: "code" });
  // photo d'un reçu (seulement si elle est rangée dans le dossier des reçus)
  if (e.parameter.photo) {
    const f = DriveApp.getFileById(e.parameter.photo);
    const par = f.getParents();
    if (!par.hasNext() || par.next().getName() !== DOSSIER_RECUS) return repondre_({ ok: false, erreur: "photo" });
    return repondre_({ ok: true, type: f.getMimeType(), data: Utilities.base64Encode(f.getBlob().getBytes()) });
  }
  return repondre_({ ok: true, docs: lire_() });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return repondre_({ ok: false, erreur: "format" }); }
  if ((req.code || "") !== CODE_SECRET) return repondre_({ ok: false, erreur: "code" });
  // création d'un événement dans votre Google Agenda (avec alerte)
  if (req.agenda) {
    const a = req.agenda;
    const ev = CalendarApp.getDefaultCalendar().createEvent(a.titre || "Tournée", new Date(a.debut), new Date(a.fin),
      { location: a.lieu || "", description: a.description || "" });
    ev.removeAllReminders();
    (a.rappels || [60]).forEach(function (m) { ev.addPopupReminder(m); });
    return repondre_({ ok: true, agenda: "cree" });
  }
  // photo d'un reçu de carburant → dossier « Ma tournée – reçus »
  if (req.photo) {
    const p = req.photo;
    const nom = String(p.nom || "recu.jpg").replace(/[\/\\]/g, "-");
    const dos = dossierRecus_();
    const ex = dos.getFilesByName(nom); while (ex.hasNext()) ex.next().setTrashed(true);
    const f = dos.createFile(Utilities.newBlob(Utilities.base64Decode(p.data), p.type || "image/jpeg", nom));
    return repondre_({ ok: true, photo: { id: f.getId(), url: f.getUrl() } });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const docs = lire_();
    (req.ecrire || []).forEach(d => { docs[d.id] = { data: d.data, maj: new Date().toISOString() }; });
    fichier_().setContent(JSON.stringify(docs));
    return repondre_({ ok: true, docs: docs });
  } finally { lock.releaseLock(); }
}
