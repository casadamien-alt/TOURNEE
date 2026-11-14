# Ma tournée scolaire — fiche pour reprendre le développement

Application web d'un chauffeur de transport scolaire (remplacements). Utilisée sur un téléphone Android (Chrome, Android Auto pour la navigation) et sur un ordinateur.

## Où est quoi
- `index.html` : **toute l'application** (HTML + CSS + JS dans un seul fichier, sans dépendance ni étape de construction). C'est le fichier à modifier.
- `manifest.json`, `icon-*.png` : installation sur l'écran d'accueil (PWA).
- `sw.js` : service minimal, utilisé seulement quand on touche la notification « Revenir à l'application » (aucun travail en arrière-plan, aucune donnée envoyée).
- `apps-script.gs` : le « serveur ». C'est un programme Google Apps Script déployé en application web par l'utilisateur sur son compte. Il stocke les données dans un fichier JSON de son Google Drive, `ma-tournee-donnees.json`, et protège l'accès par un code secret (`CODE_SECRET`). Il sert aussi à créer les événements Google Agenda et à ranger les photos de reçus de carburant (dossier « Ma tournée – reçus »).
- Site publié par GitHub Pages depuis la branche `main` : https://casadamien-alt.github.io/TOURNEE/

## Règles importantes
1. **Données personnelles d'enfants** : rien de réel dans ce dépôt public (ni noms, ni adresses, ni numéros). Les données vivent seulement dans le Drive de l'utilisateur.
2. **Le code secret ne doit jamais être demandé ni écrit dans le code** : l'utilisateur le tape dans l'application, qui le garde dans `localStorage` (`tournee-code-secret`). L'adresse du programme Google est la constante `ENDPOINT` dans `index.html`.
3. **Un `git push` sur `main` change immédiatement l'application réelle** que le chauffeur utilise en tournée. Pour des essais, travailler sur une autre branche ou une copie du dépôt (voir plus bas).
4. Interface et textes en français simple, gros boutons, utilisable d'une main entre deux arrêts.

## Fonctionnement des données
- État principal `S` (document `tournee`) : `chauffeur`, `domicile`, `tpl` (modèles de SMS), `tournees[]`, `active` (tournée en cours), `next` (prochaine tournée prévue), `pleins[]` et `vehicules[]` (carburant).
- Historique `H` : un document par mois, `hist-AAAA-MM`, avec une liste d'entrées (début, fin, durée, enfants, absents, étapes).
- Tournée : `{id, nom, multi, pause, dateUnique, midiOn, responsable, remplacement, ordreSoir, etabs[], enfants[]}`. L'établissement a des horaires par jour de semaine et un champ GPS facultatif.
- Enfant : adresse, heure de ramassage du matin, commentaires matin et soir, `contacts[]`, `absences[]` et `altAdr[]`. Les autres adresses ont des jours matin et soir, une semaine sur deux possible, et une heure du matin propre (vide = heure générale).
- Synchronisation : `save()` / `saveHist()` marquent les documents à envoyer. L'envoi groupé se fait par `POST {code, ecrire:[{id,data}]}`. La relecture se fait toutes les 20 s et au retour sur l'application, par `GET ?code=`.

## Grandes fonctions (chercher le nom dans index.html)
- Tournée en cours : `startRun`, `startMidi`, `effKid` (adresse et heure selon le jour), `nextTarget`, `validateBtn`, `pickupSheet`, `skipSheet`, `arriveSheet` (arrivée détectée par GPS).
- Planification : `proposalHtml`, `planForm`, `setNext`, `defaultHeure`, `approachMins`, `agendaViaScript`.
- Relevés : `reportSheet`, `makePdf` (écrit le PDF à la main), `makePng`, `repText`. Le relevé inclut une rubrique Carburant (`repPleins`, `fuelRows`).
- Familles et contacts : `renderFamilles`, `contactRows`, `saveVcf`.
- Carburant : `renderCarbu`, `plSheet`, `plFromFile`, `runOcr` (Tesseract.js chargé depuis jsDelivr), `parseRecu`, `uploadPhotos`, `crepPdf`.
- Les clics passent par un seul gestionnaire avec des `data-act="..."` (chercher `case "nomAction"`).

## Faire des essais sans casser l'application réelle
- **Copie du dépôt** (par exemple `TOURNEE-ESSAI` avec GitHub Pages) : on obtient une autre adresse web. **Attention** : si on y tape le même code secret, la copie lit et écrit les **vraies** données. Pour être tranquille, déployer un second programme Google (nouveau projet Apps Script avec un autre `NOM_FICHIER`) et mettre sa propre adresse dans `ENDPOINT`.
- On peut aussi ouvrir `index.html` en local dans Chrome, sans code secret, pour regarder l'interface.

## Historique
L'application a été construite dans une conversation avec Claude. La source d'origine contient aussi une version compatible « artefact Claude », mais **c'est `index.html` qui fait foi**.
