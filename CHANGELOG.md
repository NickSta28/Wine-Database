# Changelog – Wine Database

Neueste Version oben. Die Versionsnummer steht in der App unter Einstellungen.
Schema: **Hauptversion.Funktionsstufe.Korrektur** – neue Funktionsblöcke erhöhen die mittlere Zahl (1.1, 1.2 …), kleinere Verbesserungen und Korrekturen die letzte.

## 1.4.0 – 19.11.2026 · Kaufberatung
- Vorschläge neu: Karte „Kaufberatung“ mit Reichweite je Weinart und Beginn der Reife-Lücke, danach „Gezielt kaufen“ (Weißwein bzw. Riesling, Rotwein, Champagner) mit passenden Weinen von der Wunschliste und aus „nochmal kaufen: ja“, „Erst trinken, nicht kaufen“, „Nachkaufen“ und Wunschliste; „Mal wieder aufmachen“ entfällt (ersetzt durch „Jetzt trinken“ auf der Übersicht)
- Neue Seite „Kaufberatung“: Trinktempo (Vorschlag aus allen Getrunken-Einträgen, mit −/+ änderbar, gilt auf allen Geräten), Ergebnis, „Reife-Lücke“ (trinkreife Flaschen je Jahr gegen deinen Bedarf) und „Schaffst du das im Fenster?“ je Rebsorte; auf dem iPad als Übersichtsseite
- Nachkaufen: auch Weine mit 4–5 Sternen; Weine aus Rebsorten mit Überhang als „später“ markiert
- Datenbank: neue Tabelle `settings` je Konto (Trinktempo)

## 1.3.0 – 19.11.2026 · Trinkreife
- Trinkfenster je Wein (trinkbar ab, Höhepunkt, trinkbar bis) mit Status „Fenster vorbei“, „Jetzt trinken“, „Trinkreif“, „Noch warten“
- Erste Schätzung für alle Weine im Bestand; neue Weine bekommen einen Vorschlag nach Rebsorte, Qualitätsstufe (aus dem Namen, sonst aus dem Preis) und Jahrgang, Champagner ohne Jahrgang ab Kaufjahr
- Wein-Detail: Karte „Trinkreife“ mit Zeitstrahl (Reifezeit, Trinkfenster, Höhepunkt, heute), Einordnung und Trinktempo; „Anpassen“ mit −/+ je Jahr und „Zur Schätzung“
- Reife-Notiz beim Trinken passt das Fenster der übrigen Flaschen desselben Weins an (zu jung → später, drüber → Ende jetzt, genau richtig → Höhepunkt schließt das Jahr ein); eigene Angaben bleiben unverändert
- Übersicht: Karte „Jetzt trinken“ mit den drei am stärksten gefährdeten Weinen (Flaschen × wie schnell der Wein kippt × Zeit seit/bis Fensterende)
- Statistik Bestand: „Reife im Keller“ (Flaschen/Wert) und „Reife nach Rebsorte“, nach Kreisdiagramm und Top-Rebsorten
- Neue Seite „Trinkfenster im Keller“: alle Weine dringend zuerst, Filter nach Status und Rebsorte; auf dem iPad als Zeitleiste mit eigenem Eintrag in der Seitenleiste
- Neuer Wein: Vorschlag für das Trinkfenster, Qualitätsstufe antippbar
- Excel-Vorlage, -Import und -Export um „Trinkbar ab“, „Höhepunkt“, „Trinkbar bis“ ergänzt; leer gelassen wird geschätzt
- Datenbank: neue Felder `drink_from`, `peak_from`, `peak_to`, `drink_to`, `window_src` in `wines`

## 1.2.4 – 19.11.2026
- Getrunken: Suchfeld über der Liste – sucht in Wein, Weingut, Rebsorte, Region, Jahrgang, Händler sowie Trinknotiz, Anlass, Datum, Bewertung und Reife; mehrere Begriffe werden kombiniert (z. B. „2022 Riesling“), Filter-Chips wirken zusätzlich; Suche bleibt beim Zurückkommen vom Wein erhalten

## 1.2.3 – 19.11.2026
- Neue Seite „Fotos nachtragen“: alle Weine ohne Etikettenfoto – auch ausgetrunkene – mit Foto-Knopf je Zeile (Einstieg: Einstellungen und Etiketten-Wand)
- Getrunken: Kamera-Knopf direkt auf Karten von Weinen ohne Etikett
- Suche: Knopf „Auch ausgetrunkene Weine zeigen“

## 1.2.2 – 19.11.2026 · Grafiken für das iPad
- „Dein Weinjahr“ auf dem iPad quer als Übersichtsseite: Jahresleiste mit Säulen je Jahr, Kopfzeile mit vier Kennzahlen, Monate mit Linie „Keller-Veränderung seit Januar“, Kalender „Deine Wein-Tage“, Etiketten-Collage der getrunkenen Weine (Lieblinge groß)
- Etiketten-Wand: im Fach Umschalter „Liste | Etiketten“ – alle Weine als Etikettenfotos, ohne Foto als Platzhalter; auf dem iPad ganzseitig mit Fach-Auswahl
- Statistik Bestand: „Rebsorte × Jahrgang“ als Raster mit Farbabstufung und Schwerpunkt, Feld antippen zeigt die Weine

## 1.2.1 – 19.11.2026
- Weinjahr: Vergleich zum Vorjahr verständlicher formuliert („53 Fl. weniger als 2022 (71)“ statt „−53 Fl. ggü. 2022“)

## 1.2.0 – 19.11.2026 · Weinjahr, Preis pro Flasche, Bewertung
- „Dein Weinjahr“: Rückblick je Jahr mit getrunkenen und gekauften Flaschen, Genusswert, Vergleich zum Vorjahr, Monat für Monat, „Neu entdeckt“ (Regionen, Weingüter, Rebsorten – Absprung zum ersten Wein), Rebsorten, Lieblinge, „Nochmal kaufen“ und Anlässe
- Einstieg: schmale Karte über den Statistik-Reitern, auf der Übersicht vom 1. Dezember bis 31. Januar eine Rückblick-Karte (ausblendbar), auf dem iPad eigener Eintrag in der Seitenleiste
- Statistik: „Preis pro Flasche“ in fünf Gruppen ohne Überschneidung (unter 10 €, 10–14,99 €, 15–24,99 €, 25–39,99 €, ab 40 €), umschaltbar Flaschen/Wert, im Bestand und im Einkauf, mit Absprung zur Weinliste
- Getrunken: Bewertung mit 1–5 Sternen und Reife („zu jung“, „genau richtig“, „drüber“); Sterne in der Getrunken-Liste und auf der Wein-Detailseite
- Excel-Vorlage, -Import und -Export um Bewertung und Reife ergänzt
- Datenbank: neue Felder `rating` und `maturity` in `drinks`

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
