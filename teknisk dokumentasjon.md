# Teknisk dokumentasjon – Nettverksskolen

## Innledning

Nettverksskolen er en interaktiv, norsk læringsapp for grunnleggende nettverk. Formålet er at elever skal lære ved å bygge nettverk visuelt: De legger komponenter på et arbeidsområde, kobler dem sammen, konfigurerer VLAN og undersøker om trafikken kan nå fram.

Appen har fem oppdrag med økende kompleksitet og en egen sandkasse for fri bygging. I oppdragene vurderes løsningen mot scenarioets krav, og eleven får poeng og konkrete tilbakemeldinger. I sandkassen finnes det ingen fasit eller poengkrav. Der kan eleven prøve egne topologier, simulere trafikk og eksportere kartet som PNG eller animert GIF.

Dette er en lokal front-end-app, ikke en nettverksemulator med faktiske IP-pakker. Den modellerer enheter, forbindelser, VLAN og mulige ruter som data i JavaScript. Trafikk som vises, er en visuell animasjon av beregnede ruter.

## Prosjektstruktur

| Fil | Ansvar |
|---|---|
| [index.html](./index.html) | Appens HTML-struktur, arbeidsområder, knapper, statusfelt og tilgjengelige kontroller. |
| [styles.css](./styles.css) | Visuell utforming, komponentkort, nettverkskart, animasjoner og responsivt mobiloppsett. |
| [game.js](./game.js) | Oppdragsdata, apptilstand, dra-og-slipp, kabling, VLAN, vurdering, simulering og eksport. |

Appen bruker vanlig HTML, CSS og JavaScript uten rammeverk eller pakkebehandler. JavaScript-koden ligger i en IIFE (en funksjon som kjøres umiddelbart) og bruker `"use strict"`. Det holder implementasjonen samlet og begrenser utilsiktet opprettelse av globale variabler.

### Kjøre og kontrollere appen

Åpne `index.html` i en moderne nettleser. Appen trenger ikke en server eller `npm install`. Google Fonts lastes via CSS når nettleseren har nettilgang; systemfonter brukes som reserve hvis fontene ikke er tilgjengelige.

JavaScript-syntaks kan kontrolleres med Node.js fra CMD:

```cmd
node --check "C:\sti\til\network-game\game.js"
```

## Form og tilstand

### Komponentregister

`components` i `game.js` beskriver komponentene som kan plasseres. Hver komponent har blant annet en visningsetikett, kort etikett og SVG-innhold for ikonet. Klienter har også `client: true`; denne egenskapen brukes av ruteberegning og vurdering.

```js
pc: {
  label: "PC",
  short: "DATAMASKIN",
  client: true,
  icon: "<rect .../>"
}
```

Komponenttypene omfatter ruter, switch, brannmur, aksesspunkt, PC, bærbar, server, skriver og IoT-enhet.

### Oppdrag og sandkasse

`levels` inneholder de fem oppdragene. Et oppdrag kan beskrive:

- tekst og mål som vises eleven
- komponentpalett og standardposisjoner
- påkrevde komponenter og antall
- VLAN, klienttilordninger og nødvendige trunker
- grupper av enheter som skal kunne kommunisere
- eventuelle tilgangsregler

`sandboxLevel` er en separat konfigurasjon uten vurderingskrav. `activeLevel()` returnerer enten det valgte oppdraget eller sandkassekonfigurasjonen, slik at delte funksjoner kan bruke samme datamodell.

Et forenklet eksempel på VLAN-data i et oppdrag:

```js
vlans: [{ id: 10, name: "Beboere" }, { id: 20, name: "Gjester" }],
vlanAssignments: { pc: 10, laptop: 20 },
requiredTrunks: [["router", "switch"]]
```

### Nettverkstilstand

Tilstanden ligger i JavaScript-minnet mens appen er åpen:

- `nodes`: plasserte komponenter
- `connections`: kabler mellom komponenter
- `selectedNodeId` og `selectedConnectionIndex`: valgte objekter
- `currentLevel` og `sandboxMode`: aktivt oppdrag eller sandkasse
- `isSimulating`: om trafikk vises

En node har blant annet `id`, `kind`, koordinatene `x` og `y`, `vlanId` og eventuelle rutertilgangsregler. Koordinatene lagres som prosentverdier i arbeidsområdet.

En forbindelse lagrer endepunktene og kabelinnstillingene:

```js
{
  a: "internet", // eller ID-en til en plassert node
  b: 3,
  mode: "trunk", // "access" eller "trunk"
  vlanId: null,
  allowedVlans: [1, 10, 20, 30]
}
```

`"internet"` er et spesielt endepunkt, ikke en vanlig node i `nodes`. Oppdragsframdrift lagres separat i `localStorage` under nøkkelen `nettverksskolen-bestatt`. Selve nettverkstopologien lagres ikke permanent.

## Brukergrensesnitt og bygging

`updateLevelContent()` oppdaterer scenarioinformasjon, oppdragsnavigasjon og komponentpalett. I sandkassen skjules vurderingsknappen og eksportknappene vises.

`addDevice()` oppretter en node og velger standardposisjon. I sandkassen fordeles komponenter utover et rutenett; i oppdrag brukes posisjonene som er definert på nivået. Komponentkortene støtter både klikk og dra-og-slipp.

`render()` bygger HTML for nodene og oppdaterer innstillinger, kontrollknapper og forbindelser. Kabellinjene tegnes som SVG av `drawConnections()`. Endepunktene beregnes fra de faktiske posisjonene og størrelsene til enhetene, slik at linjene følger komponentene når de flyttes eller vinduet endres.

### Kabling og VLAN

Når kabelverktøyet er valgt, kobler `onEndpointClick()` sammen to valgte endepunkter. I sandkassen blir klientkabler access-kabler på VLAN 1 som utgangspunkt. Forbindelser mellom ruter–switch, switch–switch og aksesspunkt–switch opprettes som trunker med sandkassens VLAN tillatt.

Oppdrag starter vanligvis nye forbindelser som access-kabler. Eleven velger kabelen for å åpne kabelredigeringen og endrer lenketype, VLAN eller tillatte VLAN. `syncClientVlans()` oppdaterer klientens VLAN fra access-kabelen til switch eller aksesspunkt.

## Vurdering av oppdrag

`evaluateNetwork()` håndterer oppdrag uten VLAN. Den sammenligner antall komponenter og topologien med kravene i nivådataene. Kritiske feil, som at klienter brukes som mellomledd eller at trafikken går utenom ruteren, behandles separat fra vanlige poengtrekk.

`evaluateVlanNetwork()` håndterer VLAN-oppdrag. Den kontrollerer blant annet:

- at nødvendige komponenter finnes
- at klienter er koblet til riktig type utstyr og har riktig VLAN
- at nødvendige trunker fører alle påkrevde VLAN
- at enheter i samme VLAN kan nå hverandre
- at klientene har en VLAN-rute til Internett
- at tilgangsreglene på ruteren er valgt når oppdraget krever det

Resultatet vises av `showEvaluation()`. Når et oppdrag bestås, legges oppdragsnummeret til i `localStorage`.

## Trafikksimulering og ruteberegning

`reachableNodes()` bruker bredde-først-søk (BFS) på forbindelsesgrafen for vanlige oppdrag. VLAN-ruting bruker i stedet `vlanPath()`, som bare følger forbindelser som tillater det aktuelle VLAN-et.

`connectionCarriesVlan()` bestemmer om en kabel kan føre et VLAN. Klientforbindelser må være access-kabler til switch eller aksesspunkt. Forbindelser mellom nettverkskomponenter, for eksempel ruter og switch, må være trunker med VLAN-et i `allowedVlans`.

`vlanSimulationPlan()` beregner ruter for klienttrafikk til Internett og for kommunikasjon mellom klienter i samme VLAN. I sandkassen opprettes klientgruppene dynamisk ut fra VLAN-ene som faktisk er brukt.

`animateTraffic()` tegner datapakker som SVG-sirkler med `<animateMotion>` langs kablene. Hvis ingen rute finnes, vises en forklaring direkte under nettverkskartet. Ved gyldig simulering vises også status der, mens `announce()` formidler status til skjermlesere.

## PNG- og GIF-eksport

Eksporten skjer lokalt i nettleseren; nettverkskartet sendes ikke til en ekstern tjeneste.

`createNetworkCanvas()` tegner kartbakgrunn, SVG-kabler, komponentikoner, etiketter og eventuelle datapakker til et HTML-canvas. PNG lages med `canvas.toBlob()`.

GIF-eksporten lager ti bilderammer. For hver ramme beregnes datapakkenes posisjon langs simuleringsrutene. `quantizeGifFrame()` konverterer fargene til en 3-3-2 RGB-palett, og `encodeGifLzw()` komprimerer bildepikslene. `createGif()` setter sammen GIF89a-header, palett, løkkeinformasjon og rammer.

`verifyGif()` prøver å dekode alle rammene med nettleserens `ImageDecoder` før nedlastingstilbudet vises. Etter generering viser appen en **Last ned PNG**- eller **Last ned GIF**-lenke. Brukeren klikker denne lenken for å laste ned Blob-filen.

## Funksjonskatalog

Denne katalogen beskriver funksjonene som er definert i [game.js](./game.js), inkludert lokale hjelpefunksjoner. Korte anonyme funksjoner (callback-funksjoner) er forklart sammen med funksjonen eller hendelsen de tilhører.

### Oppstart, brukergrensesnitt og bygging

| Funksjon | Forklaring |
|---|---|
| IIFE (`(() => { ... })()`) | Omslutter appkoden i en funksjon som kjøres umiddelbart. Det gir et lokalt scope for tilstand og hjelpere, og `"use strict"` håndheves innenfor dette scopet. |
| `iconMarkup(kind)` | Lager SVG-markup for ikonet til en komponenttype fra `components`. Brukes både i komponentpaletten og på kartet. |
| `activeLevel()` | Returnerer `sandboxLevel` når sandkassen er aktiv, ellers nivået som er valgt i `levels`. |
| `updateLevelContent()` | Oppdaterer scenariotittel, mål, oppdragsliste, komponentpalett og synlige knapper. Binder også klikk-, tastatur- og pekerhendelser til oppdragsknapper og palettkort. |
| `updateVlanPanel()` | Viser eller skjuler VLAN-panelet og tilgangsregelredigeringen. Oppdaterer forklaringstekst og rutervalg for tilgangsregler. |
| `toggleCableTool()` | Slår kabelverktøyet av eller på, nullstiller valg og viser en kort statusmelding. |
| `connectionEndpointLabel(id)` | Gir et lesbart navn for et kabelendepunkt, inkludert det spesielle endepunktet Internett. |
| `syncClientVlans()` | Finner klientenes access-kabel til en switch eller et aksesspunkt og synkroniserer klientens `vlanId`. Uten en gyldig slik kabel blir verdien `null`. |
| `updateCableEditor()` | Fyller inn innstillingene for valgt kabel. Skjuler valg som ikke er relevante, og bygger VLAN-valg og avkrysningsbokser for trunk. |
| `loadLevel(index)` | Validerer nivånummeret, stopper simulering og nullstiller nettverkstilstanden før oppdraget lastes. |
| `loadSandbox()` | Nullstiller nettverkstilstanden og åpner fri bygging uten oppdragsvurdering. |
| `sandboxPosition(index)` | Regner ut en startposisjon for en ny komponent i sandkassens kolonne-/radoppsett. Bruker tettere rader på smale skjermer. |
| `addDevice(kind, x, y)` | Kontrollerer at komponenten finnes i den aktive paletten, velger eller begrenser posisjonen, oppretter noden og tegner kartet på nytt. |
| `render()` | Tegner nodene og oppdaterer valg, tellere, kontrollknapper, VLAN- og kabelredigering. Binder også pekerhendelser for flytting og klikkhendelser for valg og sletting. |
| `onEndpointClick(id)` | Håndterer valg av komponent eller Internett som kabelendepunkt. I kabelmodus lager den en forbindelse, hindrer duplikater, velger standard access/trunk og synkroniserer VLAN. |
| `onDeviceClick(id)` | Sender klikk på en enhet videre til `onEndpointClick()`, slik at samme logikk brukes for alle endepunkter. |
| `drawConnections()` | Beregner hvor kablene møter komponentene og tegner kabelstreker, porter, VLAN-etiketter og trunk-etiketter i SVG. Binder klikk på kabel til valg av kabel. |
| `removeConnection(index)` | Fjerner kabelen med gitt indeks, synkroniserer klientenes VLAN og tegner kartet på nytt. |
| `deleteDevice(id)` | Fjerner valgt komponent og alle kabler som bruker den. Oppdaterer valg, tilstand og kart. |
| `onInternetClick()` | Behandler Internett som et kabelendepunkt ved å kalle `onEndpointClick("internet")`. |

`drawConnections()` inneholder hjelpefunksjonen `boundaryPoint(anchor, target)`. Den beregner punktet på kanten av en sirkulær eller rektangulær enhet der kabelen skal begynne eller slutte.

### Nettverksruter og vurdering

| Funksjon | Forklaring |
|---|---|
| `reachableNodes()` | Bygger en graf av alle kabler og bruker bredde-først-søk fra Internett. Returnerer både nabokartet og foreldrekartet som trengs for å rekonstruere ruter. |
| `connectionCarriesVlan(edge, vlanId, nodeById)` | Avgjør om en bestemt kabel kan føre VLAN-et. Kontrollerer særregler for Internett, klienters access-kabler, brannmur–ruter og trunker mellom nettverksutstyr. |
| `vlanPath(sourceId, targetId, vlanId)` | Søker etter en gyldig rute for ett VLAN ved å bare følge kabler som godkjennes av `connectionCarriesVlan()`. Returnerer endepunktene i ruten eller `null`. |
| `evaluateNetwork()` | Vurderer oppdrag uten VLAN. Teller komponenter og klienter med Internett-rute, undersøker gateway-rekkefølge og topologi, beregner trekk og avgjør om oppdraget er bestått. Sender resultatet til `showEvaluation()`. |
| `evaluateVlanNetwork()` | Vurderer VLAN-oppdrag. Kontrollerer komponenter, VLAN, access-kabler, trunker, kommunikasjon mellom like VLAN, Internett-ruter og tilgangsregler. Beregner poeng og kritiske feil. |
| `showEvaluation(finalScore, passed, criticalErrors, findings)` | Viser poengsum, overskrift, oppsummering og punktvis tilbakemelding. Lagrer et bestått oppdrag i `localStorage` og oppdaterer oppdragslisten. |
| `shortestPath(targetId, parent)` | Går bakover gjennom `parent`-kartet fra et mål til Internett og returnerer ruten i riktig rekkefølge. Returnerer `null` hvis målet ikke er nåbart. |

`evaluateNetwork()` har to lokale hjelpere:

- `isLinked(a, b)` sjekker om to ID-er har en direkte kabel, uavhengig av hvilken ende som ble lagret først.
- `gatewayOrderIsCorrect(path)` kontrollerer at Internett-, brannmur-, ruter- og switchrekkefølgen følger det aktuelle oppdraget.

### Trafikksimulering

| Funksjon | Forklaring |
|---|---|
| `startSimulation()` | Velger VLAN-simulering når aktivt nivå har VLAN. Ellers finner den nåbare klienter, viser veiledning hvis ingen kan nå Internett og starter animasjonen for gyldige ruter. |
| `vlanSimulationPlan()` | Lager VLAN-rutene som skal animeres. Tar med Internett-trafikk, kommunikasjon innenfor samme VLAN og trafikk som blokkeres av regler eller VLAN-skille. Returnerer ruter og antall blokkerte/manglende forbindelser. |
| `startVlanSimulation()` | Starter VLAN-simuleringen og velger statusmelding etter om ruter mangler, eller om regler/trunker blokkerer trafikk. |
| `animateTraffic(routes, message)` | Lager SVG-datapakker med `animateMotion` langs kabelstrekningene og oppdaterer status for simuleringen. |
| `stopSimulation()` | Stopper simuleringstilstanden, fjerner datapakkene fra SVG og setter simuleringknappen tilbake til starttilstand. |

### Tegning og bildefiler

| Funksjon | Forklaring |
|---|---|
| `getCanvasIcon(kind)` | Lager et bildeobjekt av komponentens SVG-ikon og mellomlagrer Promise-resultatet i `exportIconCache`. Avviser Promise-et med en forklarende feil hvis ikonet ikke kan lastes. |
| `relativeBounds(element, boardBounds)` | Returnerer et elements posisjon og størrelse relativt til nettverkskartet; brukes når HTML-elementer skal tegnes på canvas. |
| `roundedRect(context, x, y, width, height, radius)` | Lager en avrundet rektangelbane på canvas. Kalleren velger selv fyll og kantlinje. |
| `routeSegments(routes, edgePoints)` | Gjør hver node-rute om til retningsbestemte kabelsegmenter ved å koble rutene til SVG-kablenes koordinater. |
| `packetLocations(routes, edgePoints, frame, frameCount)` | Regner ut datapakkenes posisjon for én animasjonsramme. Fordeler bevegelsen langs hele ruten, også når ruten har flere kabler. |
| `createNetworkCanvas(maxWidth, maxHeight, routes, frame, frameCount)` | Tegner bakgrunn, kabler, etiketter, Internett-symbol, komponenter og datapakker på et canvas. Skalerer bildet innenfor oppgitte dimensjoner og avviser ved synlige tegnefeil. |
| `simulationRoutes()` | Henter rutene for eksport: VLAN-ruter fra `vlanSimulationPlan()` eller vanlige Internett-ruter fra BFS-resultatet. |
| `canvasToBlob(canvas, type)` | Gjør canvas om til en Blob gjennom `toBlob()`. Avviser Promise-et hvis nettleseren ikke produserer en bildefil. |
| `quantizeGifFrame(imageData)` | Gjør RGBA-pikslene om til indeksverdier i GIF-ens 3-3-2 RGB-fargepalett. |
| `encodeGifLzw(pixels)` | Komprimerer pikselindeksene med GIF-formatets LZW-algoritme og returnerer komprimerte bytes. |
| `createGif(frames, width, height, delay)` | Setter sammen GIF89a-header, fargepalett, løkkeutvidelse, rammer og komprimerte bildedata til en GIF-Blob. |
| `verifyGif(blob, width, height, expectedFrames)` | Kontrollerer at GIF-en kan dekodes og har forventet antall rammer og dimensjoner. Bruker `ImageDecoder` når nettleseren støtter det, ellers et `Image`-element. |
| `clearBoardStatus()` | Skjuler status- og nedlastingslenke, fjerner gamle lenkedetaljer og planlegger frigjøring av tidligere Blob-URL. |
| `showBoardStatus(message, isError, download)` | Viser status, feilutseende ved behov og eventuelt en nedlastingslenke med filnavn og Blob-URL. |
| `exportNetwork(format)` | Deaktiverer eksportknappene mens filen lages. Lager PNG eller ti GIF-rammer, validerer GIF-en, viser lenke for nedlasting og presenterer eventuelle feil. Knappene aktiveres igjen i `finally`. |
| `announce(message)` | Oppdaterer statusområdet for skjermlesere. Tømmer først teksten og setter den på neste animasjonsramme for å sikre at samme melding kan annonseres på nytt. |

`encodeGifLzw()` bruker to lokale hjelpere: `writeCode(code)` pakker LZW-koder inn i bitstrømmen, og `resetDictionary()` nullstiller kodeordboken og kodebredden når GIF-komprimeringen starter på nytt. `createGif()` bruker `bytes(values)` og `text(value)` for å legge henholdsvis bytefelt og tekstfelt til GIF-ens utdata.

### Anonyme funksjoner og hendelsescallbacks

Appen bruker også korte inline-funksjoner. De har ikke egne navn, men er viktige deler av brukerflyten:

- **Palett og oppdragsliste:** callbackene i `updateLevelContent()` reagerer på klikk og tastatur, starter pekerbasert dra-og-slipp, oppretter en dra-spøkelse, og legger komponenter til når slippet skjer over kartet.
- **Komponenter og kabler på kartet:** callbackene i `render()` håndterer valg, flytting, frigjøring av peker og sletting. Callbackene i `drawConnections()` velger en kabel når SVG-linjen klikkes.
- **Kontroller og innstillinger:** hendelsescallbackene ved oppstart håndterer klikk på slett/nullstill/vurder/simuler/eksporter, endring av kabeltype og VLAN, tilgangsregler og fjerning av kabel. Tastaturcallbacken gjør Internett-endepunktet tilgjengelig med Enter og mellomrom.
- **Samlinger og løfter:** callbackene til `map`, `filter`, `find`, `some`, `every`, `forEach` og `Promise` bygger visning, søker i nettverksdata, beregner vurderingskrav, tegner elementer og håndterer asynkron bildeinnlasting. De utfører arbeidet som er beskrevet i funksjonen de står i.
- **Vindu og GIF-reservekontroll:** `resize`-callbacken tegner kablene på nytt når vinduet endres. `onload`/`onerror`-callbackene håndterer vellykket eller mislykket lasting av SVG-ikoner og dekoding av GIF i nettlesere uten `ImageDecoder`.

## Utvidelse og vedlikehold

- **Legge til en komponent:** legg til en oppføring i `components`. Sett `client: true` hvis den skal behandles som klient i ruteberegning og vurdering.
- **Legge til et oppdrag:** legg til et nivå i `levels` med tekst, palett, krav og posisjoner. VLAN-oppdrag må også ha relevante VLAN- og rutekrav.
- **Legge til en ny type nettverksforbindelse:** oppdater både standardopprettelsen i `onEndpointClick()` og reglene i `connectionCarriesVlan()`. Vurder også om oppdragsvurderingen må kjenne til den.
- **Endre GIF-format eller kvalitet:** se rammetallet i `exportNetwork()`, dimensjonsgrensene i `createNetworkCanvas()` og palett-/komprimeringsfunksjonene for GIF.

Rutemodellen er pedagogisk og forenklet: Appen håndterer ikke faktiske IP-adresser, subnett, DHCP, DNS eller nettverkspakker. Internett-noden er et visuelt endepunkt, og vurderingen avgjør tilgang ved å undersøke forbindelsesgrafen, VLAN og regler.
