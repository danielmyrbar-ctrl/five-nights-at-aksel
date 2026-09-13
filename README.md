# Five Nights at Aksel

Et uoffisielt fanskrekkspill inspirert av Five Nights at Freddy's. Overlev fra 00:00 til 06:00 mens Aksel beveger seg gjennom bygningen og forsøker å komme inn i vaktrommet.

**Spill:** https://danielmyrbar-ctrl.github.io/five-nights-at-aksel/

## Innhold

- Fem netter med økende vanskelighetsgrad; hver natt varer fire minutter.
- Seks kameraer som viser Aksels faktiske plassering.
- Én kontordør og ganglys. Vanlig kontorvisning bruker ingen strøm.
- Strømforbruk, strømbrudd, jumpscare, seier og ny start.
- De originale rombildene og kartet fra prosjektets eier, med CRT-effekter.
- Startskjerm 1 vises normalt; bilde 2 og 3 blinker inn i korte, uregelmessige glitcher.
- Vaskerom har to Aksel-posisjoner på samme kamera: langt unna og nærmere utgangen.
- Stereoskritt, bakgrunnssumming, dørsjokk, banking, kamerastøy og sluttlyder via Web Audio.
- Lagret fremgang, pause og automatisk pause når fanen skjules.
- Norske menyer, tastatur og klikk-/berøringsknapper.

## Kontroller

| Tast | Handling |
|---|---|
| D (eller A) | Åpne / lukke kontordøren |
| E (eller Q) | Slå ganglyset av / på |
| Mellomrom | Åpne / lukke kameraer |
| 1–6 | Bytte kamera mens skjermen er åpen |
| Escape | Pause / fortsette |

Lyd aktiveres når du starter. Spillet inneholder høye lyder og jumpscares.
Sjekk kameraene og følg Aksel på kartet. Når han ser inn gjennom kontordøren, har du bare noen sekunder igjen til å lukke den. Vent på bankingen før du åpner igjen. Kamera, lys og lukket dør bruker strøm; vanlig kontorvisning gjør ikke det.

## Bilder og kart

Kameraene er vaskerom, kjøkken, stua, gang, stage og Alvar-rom. Kameraknappene ligger på `kart.png`. Aksel starter i vaskerommet og beveger seg gjennom tilkoblede rom før han når kontoret via gangen.

Hvert rom bruker det tomme bildet når Aksel er et annet sted. `vaskerom aksel1.png` og `vaskerom aksel2.png` er to stadier på kamera 01. Kontoret viser `office.png`, `office lys.png`, `office lukket.png` eller `office aksel.png` etter situasjonen. Lukket dør har prioritet. Ved tap brukes `jumpscare.png`.

Alle bildene lastes før Start blir tilgjengelig, slik at skifte av rom og jumpscare ikke må vente på nedlasting. Første innlasting kan derfor ta litt tid.

## Kjør lokalt

Ingen pakker eller byggetrinn kreves. Åpne `index.html`, eller kjør:

```sh
python3 -m http.server 8080
```

Åpne http://localhost:8080. Moderne nettleser med Canvas 2D og Web Audio kreves. Landskapsvisning anbefales på mobil.

## Test

Med Node.js installert:

```sh
node --test engine.test.js
```

Tester dekker kartforbindelser, begge vaskerom-stadier, kontorbildenes prioritet, siste sjanse ved døren, strømforbruk, strømbrudd og vinnbarhet for alle fem netter.

## Filer og rettigheter

`engine.js` inneholder simuleringen, `game.js` grafikk/lyd/kontroller, `assets.js` kobler til de nøyaktige bildefilnavnene, og `style.css` former grensesnittet. Bildene er levert av prosjektets eier og gis ingen separat gjenbrukslisens her. Ingen originale FNAF-bilder eller lydfiler brukes. Prosjektet er ikke tilknyttet eller godkjent av skaperne av Five Nights at Freddy's.
