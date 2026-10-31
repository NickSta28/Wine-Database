# Wine Database

Private Web-App (PWA) für den eigenen Weinkeller: digitales Weinregal, Detailansicht je Wein mit Etikett,
Käufe, „Getrunken“-Erinnerungen mit eigener Notiz, Wunschliste und Statistik.
Läuft als statische Seite auf GitHub Pages, Daten, Logins und Etiketten liegen in Supabase.
Jedes Konto sieht ausschließlich seine eigenen Daten.

- `index.html`, `css/`, `js/` – die App
- `supabase/` – Datenbank-Schema und Einrichtung (siehe `supabase/README.md`)
- `.github/workflows/keepalive.yml` – hält das kostenlose Supabase-Projekt wach

Persönliche Daten (Import-Dateien, Sicherungen) gehören nicht in dieses öffentliche Repo.
