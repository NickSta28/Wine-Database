# Changelog – Wine Database

Neueste Version oben. Die Versionsnummer steht in der App unter Einstellungen.
Schema: **Hauptversion.Funktionsstufe.Korrektur** – neue Funktionsblöcke erhöhen die mittlere Zahl (1.1, 1.2 …), kleinere Verbesserungen und Korrekturen die letzte.

## 1.1.0 – 18.11.2026 · Mehrere Nutzer und Excel
- Excel-Import (.xlsx, .xlsm, .csv) mit automatischer Erkennung von Blättern und Spalten, Vorschau („Nicht übernommen“, Hinweise) und manueller Zuordnung
- Bereits vorhandene Weine und Wünsche werden beim Import übersprungen (kein doppelter Import)
- Excel-Vorlage zum Herunterladen (Mindest- und Ideal-Struktur)
- Export „Als Excel exportieren“ im Aufbau der Vorlage, wieder importierbar
- Passwort ändern (mit Prüfung des alten Passworts)
- „Alle meine Daten löschen“ mit Bestätigung
- Startseite für ein leeres Konto: Excel importieren, ersten Wein anlegen, Vorlage

## 1.0.19 – 18.11.2026
- iPad quer: Wein aus Fach, Suche oder Statistik-Liste öffnet Liste links und Detail rechts; Liste behält ihre Position, Zurück „Regalansicht“

## 1.0.18 – 17.11.2026
- iPhone quer behält das Telefon-Layout (iPad-Ansicht erst ab 800 pt Breite und 600 pt Höhe)

## 1.0.17 – 17.11.2026 · iPad, Stufe 3
- Getrunken (iPad): Zeitstrahl der letzten Erinnerungen, blätterbar; „Getrunken je Jahr“ inkl. „ohne Datum“; Anlässe als Filter
- Statistik: Verlauf je Quartal (gekauft nach oben, getrunken nach unten) und Balken „ohne Datum“

## 1.0.16 – 17.11.2026 · iPad, Stufe 2
- Regal und Fach nebeneinander, gewähltes Fach markiert
- Übersicht als Dashboard mit Regal und „Gekauft und getrunken pro Jahr“
- Statistik-Reiter „Alles“
- Ansicht baut sich beim Drehen automatisch um

## 1.0.15 – 17.11.2026 · iPad, Stufe 1
- Seitenleiste statt Tab-Leiste ab 800 pt Breite
- Regal mit vier Fächern pro Reihe, Karten und Diagramme zweispaltig
- Dialoge mittig statt von unten

## 1.0.14 – 02.11.2026
- Aktiver Menüpunkt farbig hinterlegt (wie im Bücher-Tracker)

## 1.0.13 – 02.11.2026
- Aktiver Menüpunkt fetter (Schrift und Symbol)

## 1.0.12 – 02.11.2026
- Neues App-Symbol: Traube aus Kapseln, auch auf der Anmeldeseite

## 1.0.11 – 02.11.2026
- Mini-Fach auf der Rebsorten-Seite wieder mit Kapselfarben je Weingut (Anordnung wie im Regal)

## 1.0.10 – 02.11.2026
- Mini-Fach in Anzahl und Anordnung identisch zum Regal
- Weinart Champagner setzt Rebsorte Champagner automatisch

## 1.0.9 – 02.11.2026
- Listen aus Statistik „Getrunken“ und „Einkauf“ nach Datum sortiert, zuletzt zuerst

## 1.0.8 – 02.11.2026
- Statistik Bestand: Balken nach Händler mit Umschalter Euro/Flaschen
- Top 5 mit Aufklappen, Absprung zu Weinlisten auch bei Getrunken und Einkauf
- Händler Dallmayr ergänzt

## 1.0.7 – 02.11.2026
- Händler Mövenpick ergänzt

## 1.0.6 – 01.11.2026
- Jahrgangs-Säulen in der Statistik antippbar
- Updates kommen sofort an (Service Worker fragt immer beim Server nach)

## 1.0.5 – 01.11.2026
- Statistik: Balkendiagramme aufklappbar, Absprung zur Weinliste

## 1.0.4 – 01.11.2026
- Händler-Links öffnen die Suche direkt im Shop statt bei Google

## 1.0.3 – 01.11.2026
- Getrunken-Einträge und Käufe nachträglich bearbeiten

## 1.0.2 – 31.10.2026
- iOS: kein Zoom-Sprung nach Eingabefeldern
- Einkauf-Statistik mit Umschalter Euro/Flaschen

## 1.0.1 – 31.10.2026
- Import: Wunschliste-Ergänzungen ohne Rückfrage

## 1.0.0 – 31.10.2026 · Erste Version
- Login je Nutzer (Supabase, getrennte Daten)
- Übersicht mit Kennzahlen, Weinregal nach Rebsorten, Fach-Liste, Wein-Detail mit Etikett und Händler-Links
- Getrunken mit Notiz, Anlass und „Nochmal kaufen“, Wunschliste, Vorschläge, Statistik (Bestand, Getrunken, Einkauf)
- Neuen Wein anlegen mit Etikett-Foto
- Einmaliger Import der bisherigen Excel-Weindatenbank
