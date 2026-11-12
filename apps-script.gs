// Ma tournée — stockage privé dans votre Google Drive (à coller dans script.google.com)
const CODE_SECRET = "CHANGEZ-MOI";   // ← remplacez par votre code secret
const NOM_FICHIER = "ma-tournee-donnees.json";

function fichier_() {
  const it = DriveApp.getFilesByName(NOM_FICHIER);
  return it.hasNext() ? it.next() : DriveApp.createFile(NOM_FICHIER, "{}", "application/json");
}
function lire_() { try { return JSON.parse(fichier_().getBlob().getDataAsString() || "{}"); } catch (e) { return {}; } }
function repondre_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  if ((e.parameter.code || "") !== CODE_SECRET) return repondre_({ ok: false, erreur: "code" });
  return repondre_({ ok: true, docs: lire_() });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return repondre_({ ok: false, erreur: "format" }); }
  if ((req.code || "") !== CODE_SECRET) return repondre_({ ok: false, erreur: "code" });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const docs = lire_();
    (req.ecrire || []).forEach(d => { docs[d.id] = { data: d.data, maj: new Date().toISOString() }; });
    fichier_().setContent(JSON.stringify(docs));
    return repondre_({ ok: true, docs: docs });
  } finally { lock.releaseLock(); }
}
