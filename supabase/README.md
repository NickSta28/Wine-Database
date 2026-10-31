# Supabase-Einrichtung (Wine Database)

1. **Datenbank:** `schema.sql` ist bereits eingespielt. Für ein neues Projekt: Dashboard > SQL Editor > New query > Inhalt einfügen > Run.
2. **Konten:** Authentication > Users > Add user (E-Mail + Passwort, „Auto Confirm User“ anhaken) für jede Person.
   Danach unter Authentication > Sign In / Providers die Option „Allow new users to sign up“ ausschalten.
3. **Trennung der Konten:** Jede Tabelle hat `user_id` und Row Level Security. Etiketten liegen im privaten
   Speicher `labels` im Ordner `<user_id>/` und werden nur über zeitlich begrenzte Links angezeigt.
