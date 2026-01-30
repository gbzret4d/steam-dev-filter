# Anleitung zur Umbenennung auf GitHub

Da wir den Code lokal bereits auf `steam-dev-filter` umgestellt haben, müssen Sie nun das Repository auf GitHub umbenennen, damit die Links (Update-Check, Datenbank) wieder funktionieren.

## Schritte

1.  Öffnen Sie Ihr Repository auf GitHub: [https://github.com/gbzret4d/steam-watchdog](https://github.com/gbzret4d/steam-watchdog)
2.  Klicken Sie oben auf den Reiter **Settings** (Einstellungen).
3.  Im Bereich "General" (ganz oben) finden Sie das Feld **Repository name**.
4.  Ändern Sie den Namen von `steam-watchdog` zu **`steam-dev-filter`**.
5.  Klicken Sie auf **Rename**.

## Nach der Umbenennung

- Der Link [https://github.com/gbzret4d/steam-dev-filter](https://github.com/gbzret4d/steam-dev-filter) wird nun erreichbar sein.
- GitHub leitet alte Links (steam-watchdog) automatisch weiter, aber für die Zukunft ist die Anpassung im Code (die wir bereits gemacht haben) wichtig.
- Sie müssen ihren lokalen Git-Remote aktualisieren (siehe unten), oder einfach weiterarbeiten (Git ist oft smart genug, aber besser ist ein Update).

### Lokalen Git-Remote aktualisieren (Optional aber empfohlen)

Öffnen Sie ein Terminal im Projektordner und führen Sie aus:

```bash
git remote set-url origin https://github.com/gbzret4d/steam-dev-filter.git
```
