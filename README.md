# Five Nights at Aksel

Et uoffisielt fanskrekkspill inspirert av Five Nights at Freddy's. Overlev fra 00:00 til 06:00 mens Aksel beveger seg gjennom bygningen og forsøker å komme inn i vaktrommet.

**Spill:** https://danielmyrbar-ctrl.github.io/five-nights-at-aksel/

## Innhold

- Fem netter med økende vanskelighetsgrad; hver natt varer fire minutter.
- Seks kameraer som viser Aksels faktiske plassering.
- To uavhengige sikkerhetsdører og lys som avslører Aksel ved døren.
- Strømforbruk, strømbrudd, jumpscare, seier og ny start.
- Prosedyregenerert vaktrom med perspektiv, belysning, animert vifte og CRT-effekter.
- Stereoskritt, bakgrunnssumming, dørsjokk, banking, kamerastøy og sluttlyder via Web Audio.
- Lagret fremgang, pause og automatisk pause når fanen skjules.
- Norske menyer, tastatur og klikk-/berøringsknapper.

## Kontroller

| Tast | Handling |
|---|---|
| A / D | Venstre / høyre dør |
| Q / E | Venstre / høyre lys |
| Mellomrom | Åpne / lukke kameraer |
| 1–6 | Bytte kamera mens skjermen er åpen |
| Escape | Pause / fortsette |

Lyd aktiveres når du starter. Spillet inneholder høye lyder og jumpscares.
Sjekk kameraene, bruk lys for å bekrefte hvilken dør Aksel står ved, og lukk riktig dør til du hører banking. Åpne igjen når han har trukket seg tilbake for å spare strøm.

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

Tester dekker begge angrepsruter, riktig/feil dør, strømforbruk, strømbrudd, kameraposisjon, vinnbarhet for alle fem netter og avsluttede spilltilstander.

## Filer og rettigheter

`engine.js` inneholder simuleringen, `game.js` grafikk/lyd/kontroller, og `style.css` grensesnittet. `aksel.png` er bildet levert av prosjektets eier. Ingen originale FNAF-bilder eller lydfiler brukes. Prosjektet er ikke tilknyttet eller godkjent av skaperne av Five Nights at Freddy's. Bildet av Aksel gis ikke en separat gjenbrukslisens av dette repositoryet.
