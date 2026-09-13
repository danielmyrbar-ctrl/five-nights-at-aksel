# Five Nights at Aksel

Et uoffisielt fanskrekkspill med fem netter, brukerens rombilder og lydfiler.

Spill: https://danielmyrbar-ctrl.github.io/five-nights-at-aksel/

## Spilleregler

Overlev fra 00:00 til 06:00 (fire minutter). Aksel starter alltid på stage og velger en rute mot vaskerommet eller Alvar-rommet gjennom rommene på kartet. Vaskerommet har to posisjoner på samme kamera. Etter at døren stopper ham, vandrer han til andre rom før et nytt forsøk.

Banking varsler at Aksel står utenfor kontoret. Han er bare synlig når ganglyset er på. Lukk døren i tide, og bruk lyset for å sjekke at han har gått. Kamera, lys og lukket dør bruker strøm; vanlig kontorvisning gjør ikke det.

På kamera 06, Alvar-rommet, holder du inne **MUSIC BOX** for å trekke opp boksen. Kakediagrammet viser gjenværende tid. Det tar rundt seks sekunder å fylle boksen, og 57–79 sekunder å tømme den, avhengig av natt. Slipp knappen for å stoppe. Kamerabytte, pause og mistet fokus stopper opptrekkingen.

Hvis boksen blir tom, er hendelsen irreversibel: Alvar vises halvtransparent over alle kameraer, den sinte lyden høres overalt, lys og dør slutter å virke, og forsøk viser «you can't». Etter tilfeldig 20–50 sekunder kommer Alvars jumpscare, også om klokken passerer 06:00 i mellomtiden.

## Kontroller

| Tast | Handling |
|---|---|
| D / A | Kontordør |
| E / Q | Ganglys |
| Mellomrom | Kameraer |
| 1–6 | Velg kamera |
| Escape | Pause |
| Hold museknapp / berøring på MUSIC BOX | Trekk opp musikkboks |
| Hold Enter / mellomrom med MUSIC BOX i fokus | Trekk opp med tastatur |

Trykk «Aktiver menylyd» for menymusikk. Start aktiverer også lyd. Nettleseren krever et klikk før lyd kan spilles. Lydknappen demper alle lyder. Pause stopper både simulering og lyd.

## Lyd og bilder

`audio.js` kobler de originale filnavnene til kontorambiente, meny, kamerabytte, lys, dør, banking, opptrekking, musikkboks, sint Alvar og jumpscare. Musikkboksens løkke går kontinuerlig under natten, men høres bare på Alvar-kameraet. `horror jingle.mp3` starter etter jumpscaren. Musikkboksen stoppes når Alvar slippes løs.

`assets.js` kobler til originalbildene. Startskjerm 1 vises lengst med korte glitcher til 2 og 3. Alvar-bildet beskjæres i Canvas: ansikt på kameraene, overkropp i jumpscaren. Originalbildet endres ikke.

Alle bilder og lydfiler lastes før Start aktiveres. Første innlasting kan ta litt tid.

## Kjør og test

Krever moderne nettleser med Canvas og Web Audio. Ingen byggetrinn eller pakker kreves. Start en lokal HTTP-server:

```sh
python3 -m http.server 8080
```

Åpne http://localhost:8080. Test simulering, vinnbarhet, Alvar og lydkanaler med:

```sh
node --test engine.test.js audio.test.js
```

`engine.js` er simuleringen; `game.js` håndterer grafikk og kontroller. Fremgang lagres lokalt. Bildene og lydfilene er levert av prosjektets eier og gis ingen separat gjenbrukslisens her. Prosjektet er ikke tilknyttet eller godkjent av skaperne av Five Nights at Freddy's.
