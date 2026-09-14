# Five Nights at Aksel

Et uoffisielt fanskrekkspill med seks netter, brukerens rombilder og lydfiler.

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
| 1–7 | Velg kamera |
| Escape | Pause |
| Hold museknapp / berøring på MUSIC BOX | Trekk opp musikkboks |
| Hold Enter / mellomrom med MUSIC BOX i fokus | Trekk opp med tastatur |

Menymusikken forsøker å starte automatisk. Hvis nettleseren blokkerer automatisk lyd, aktiveres den ved første vanlige klikk eller tastetrykk. Ingen egen aktiveringsknapp kreves. Lydknappen demper alle lyder. Pause stopper både simulering og lyd.

## Lyd og bilder

`audio.js` kobler de originale filnavnene til kontorambiente, meny, kamerabytte, lys, dør, banking, opptrekking, musikkboks, sint Alvar og jumpscare. Musikkboksens løkke går kontinuerlig under natten, men høres bare på Alvar-kameraet. `horror jingle.mp3` starter etter jumpscaren. Musikkboksen stoppes når Alvar slippes løs.

`assets.js` kobler til originalbildene. Startskjerm 1 vises lengst med korte glitcher til 2 og 3. Alvar-bildet beskjæres i Canvas: ansikt på kameraene, overkropp i jumpscaren. Originalbildet endres ikke.

Bildene lastes før Start aktiveres. Lydene lastes uavhengig: en lydfeil kan ikke låse Start. RF64/WAV-originalene er bevart, men spillet bruker kompatible MP3-kopier.

## Kjør og test

Krever moderne nettleser med Canvas og Web Audio. Ingen byggetrinn eller pakker kreves. Start en lokal HTTP-server:

```sh
python3 -m http.server 8080
```

Åpne http://localhost:8080. Test simulering, vinnbarhet, Alvar og lydkanaler med:

```sh
node --test engine.test.js audio.test.js memories.test.js ending.test.js epilogue.test.js
```

`engine.js` er simuleringen; `game.js` håndterer grafikk og kontroller. Fremgang lagres lokalt. Bildene og lydfilene er levert av prosjektets eier og gis ingen separat gjenbrukslisens her. Prosjektet er ikke tilknyttet eller godkjent av skaperne av Five Nights at Freddy's.

## Minner og Daniel (versjon 4)

Etter hver av de første fem nettene åpnes et spillbart 8-bit-minne. Flytt med piltaster/WASD eller skjermknappene, samle tre ledetråder og gå til stolen øverst til høyre. Etter minnet låses neste natt opp. Pause fungerer med Escape eller skjermknappen.

Hvert minne har en egen rominndeling, gjenstandsplassering og del av den fiktive historien. 18 % sjanse per minne gir en skjult Daniel-hendelse når du utforsker høyre del av rommet. Den er ikke nødvendig for å fullføre. Ingen hemmelighet sletter fremgang.

Daniel kan fra natt 2 dukke opp etter at kameraet senkes (7 % sjanse, minst 35 sekunder inn og 50 sekunders nedkjøling). Han følger ikke dørene: åpne kameraet igjen innen fem sekunder for å se bort. Alvar-hendelsen har prioritet. `daniel3.png` er skikkelsen, `daniel2.png` nærbildet, og `daniel1.jpg` det sjeldne røde minneglimtet.

## Bilsekvens, natt 6 og kamera 07 (versjon 5)

Etter minnet fra natt 5 vises 06:00 før bildet fader over til `introcar.mp4` med `ending.mp3`. Begge bilvideoene er alltid lydløse. Når introen slutter vises `velgbil.jpg` og «gå til bil». Knappen spiller `walktocar.mp4`. Deretter blir det svart, og `car not started.png` fader inn. Etter 2,5 sekunder med det ferdig innfadede bildet vises «start bil».

Hvert bilforsøk velger tilfeldig mellom de kompatible kopiene av `start1.wav` og `start2.wav`. `car trying to start.jpg` vises til den valgte lyden faktisk er ferdig. Så vises bilen uten lys igjen. Du kan forsøke ubegrenset mange ganger. Etter første ferdige forsøk kan du velge «gå inn igjen»: bilde og musikk fader ut over tre sekunder, natt 6 låses opp og starter. Natt 6 har høyere vanskelighetsgrad og en større epilog utenfor bygningen. Pause og lyd av/på finnes også under bilsekvensen.

Kamera 07, «Daniel rom», ligger i sirkelen under Alvar-rommet på kartet. Bildet er svart. `danielrom-compatible.mp3` (fra `danielrom.wav`) looper gjennom hele natten, også når kameraet ikke er valgt. Den blir bare hørbar når skjermen er oppe på kamera 07.

Menymusikken strømmes fra HTML-lydspilleren før resten av spillet lastes, uten å vente på at hele lydfilen blir dekodet. Nettleserens krav om første klikk gjelder fortsatt der automatisk lyd er blokkert.

## Utenfor kartet og spritegalleri (versjon 6)

Etter natt 6 går du ut i regnet, finner en rød sedan, kjører østover og går inn i Arkiv 02. Styr med WASD/piltaster eller skjermknappene. E, Enter eller mellomrom bruker bilen og døren når du står nær nok. Escape setter epilogen på pause.

Etter den mystiske avslutningen fader spillet tilbake til menyen og låser opp **SPRITEGALLERI**. Galleriet viser figurene og pikselgrafikken fra epilogen. Bruk forrige/neste eller piltastene; Escape lukker galleriet. Opplåsingen lagres lokalt i nettleseren.

## Minispill og menylyd (versjon 7)

Menylyden prøves på nytt når lyddata er klare, ved tilbakekomst til vinduet og ved vanlige klikk/tastetrykk. Lyd av/på skal ikke være nødvendig; nettleserens regel om brukerinteraksjon gjelder fortsatt. Den klikkbare FNA/A-logoen er fjernet.

Daniel kan vise det røde ansiktet i kamera 07 i fem sekunder. Hver opptreden gir bare én jingle, først når kameraet faktisk viser ansiktet. Alvars raseri overstyrer opptredenen.

Minne 1 krever levering av ett navneskilt om gangen. I minne 2 er du Aksel i verkstedet og leter etter ABS-filament. Funnet utløser en syv sekunders Daniel-sekvens med «you can't» før spillet går videre automatisk. Minne 3 krever opptakene i riktig rekkefølge. Minne 4 har en forfølgende skygge som sender deg til starten, men beholder sporene dine. Minne 5 har et snevert lysfelt. Alle beholder pikselgrafikk, chiptune og den urolige minne-stemningen.

## Sikringsskapet etter natt 3 (versjon 8)

Etter 8-bit-minnet må alle fire systemer restartes før natt 4 låses opp. Ruter tar 6 sekunder, 3D Printer 11, Varmepumpe 8 og Kamerasystem 14. Ett system om gangen; arbeidet fortsetter når du ser tilbake på Daniel. Pilknappen eller piltastene snur hodet. Escape pauser. Daniel går bare fremover gjennom stage 0–4, med 7–11 sekunder per steg mens du ser bort. Tom stol gir 14–20 sekunder før jumpscare, uansett synsretning. Tap lar deg prøve denne sekvensen igjen.

Test sekvensen med `node --test breaker.test.js`.

## Lyd og bilde i Daniel-sekvensen (versjon 9)

Snuing bruker en rask 160 ms fading og `snu.wav`; tilbakepilen står til venstre ved sikringsskapet. Daniel-bevegelse bruker `bevegelse.wav`, med `bevegelse2.wav` ved tom stol. Kontorambiente og `ambiance2.wav` går samtidig. Lyse 8-bit-toner følger restartfremgangen, og et animert støylag gir videokorn. Pauseknappen og Escape-pause er fjernet fra denne sekvensen; skjult nettleserfane stopper midlertidig og fortsetter automatisk ved retur. Originale WAV-filer beholdes, og nettleseren bruker kompatible MP3-kopier.

## Stjerner, Custom Night og siste minne (versjon 10)

Overlev natt 5 for én menystjerne, natt 6 for to og natt 7 for tre. Stjerner lagres lokalt. Tidligere spillere med opplåst natt 6 får første stjerne; fullført epilog og spritegalleri gir to. Etter natt 6 åpnes Custom Night i menyen. Still Aksel, Alvar og Daniel uavhengig fra 0 til 20. Null deaktiverer figurens angrep. Alle kombinasjoner gir tredje stjerne ved seier.

20/20/20 gir raske Aksel-ruter, kortere reaksjonstid, hyppigere Daniel og en musikkboks som tømmes på omtrent 18 sekunder. En test spiller 40 ulike tilfeldige forløp med reaksjoner hvert halve sekund og bekrefter at strømmen rekker med aktiv styring.

Etter natt 7 spiller du Alvar: hent snus til Daniel og Urge til Aksel, som ligger urørlige på gulvet. Lever begge og gå til presangen i midten. Avslutningen fader til «Du vant» og «denne gang...» før menyen kommer tilbake. Beveg deg med WASD/piltaster eller skjermknappene. Test med `node --test custom.test.js`.
