# Wine Database

Private Web-App (PWA) für den eigenen Weinkeller: digitales Weinregal, Detailansicht je Wein mit Etikett,
Käufe, „Getrunken“-Erinnerungen mit eigener Notiz, Wunschliste und Statistik.
Läuft als statische Seite auf GitHub Pages, Daten, Logins und Etiketten liegen in Supabase.
Jedes Konto sieht ausschließlich seine eigenen Daten.

- `index.html`, `css/`, `js/` – die App
- `supabase/` – Datenbank-Schema und Einrichtung (siehe `supabase/README.md`)
- `.github/workflows/keepalive.yml` – hält das kostenlose Supabase-Projekt wach

Persönliche Daten (Import-Dateien, Sicherungen) gehören nicht in dieses öffentliche Repo.

## Weiteres Konto anlegen (z. B. für Freunde)

Selbst-Registrierung ist ausgeschaltet. Neue Konten legt der Projekt-Inhaber an:

1. Supabase-Dashboard → Projekt „Wine Database“ → **Authentication → Users → Add user → Create new user**
2. E-Mail und ein Startpasswort eintragen, **Auto Confirm User** anhaken, speichern
3. App-Link und Startpasswort persönlich weitergeben; das Passwort lässt sich in der App unter Einstellungen → „Passwort ändern“ ändern

Jedes Konto sieht nur die eigenen Daten (Row Level Security auf allen Tabellen, eigener Etiketten-Ordner).
Der Projekt-Inhaber kann im Supabase-Dashboard technisch alle Daten einsehen.

## Excel-Import

Vorlage: `vorlage/Weinkeller-Importvorlage.xlsx` (auch in der App unter Einstellungen bzw. auf der Startseite eines leeren Kontos).
Mindestangaben im Blatt „Weine“: Weingut, Wein, Weinart, Rebsorte, Flaschen im Keller. Optional die Blätter „Käufe“, „Getrunken“ und „Wunschliste“.
Optional im Blatt „Weine“: „Trinkbar ab“, „Höhepunkt“ (z. B. 2025–2028), „Trinkbar bis“ – fehlen sie, schätzt die App das Trinkfenster (Regeln in `js/reife.js`).
Andere Excel-Listen werden ebenfalls gelesen; Spalten lassen sich vor dem Import zuordnen. Die Datei wird nur im Browser gelesen.
