# F-App (f-app)

Fisher's best friend in an app built on Quasar, Vue, and Supabase using edge functions

## Install the dependencies
```bash
npm install
```

### Start the app in development mode
```bash
npm run dev
```


### Lint the files
```bash
npm run lint
```


### Build the app for production
```bash
quasar build
```


### Edge functions
If you want to add new functions to the project the setup is as follows:
```bash
cd ./supabase/functions
mkdir name-of-function
cd name-of-function
touch index.ts
```

Then, code your function until ready.
When ready, 
```bash
cd ../../..
npx supabase functions deploy name-of-function
```

## Perspektivering
Projektet med at udvikle Fisherman's App har været en rejse med læring. Gennem  SCRUM kunne udviklergruppen tilpasse og forbedre appen løbende baseret på feedback fra fokusgruppen, hvilket holdt os på rette vej. Desuden bidrog disse møder til sparring om visionen og har været det eneste interpersonelle samarbejde i arbejdsprocessen. Fuldstændig vitalt for udviklerteamet.
Teknologiske valg som Vue med Quasar og Supabase har vist sig at være taknemlige at arbejde med forstået på den måde, at de i større grad er plug and play-løsninger helt ned til at Quasar kommer med prædefinerede farver (primary, secondary, negative), indtil vi selv valgte at ændre på dem.
I fremtiden kunne Fisherman's App udvides og forbedres med avancerede funktioner som real-time-overvågning, opgraderet vejr-API, caching, som kunne forbedre UX, m.fl. Derudover er der potentiale for monetisering gennem premiumfunktioner og strategiske partnerskaber, som kunne styrke appens markedsposition og især økonomiske bæredygtighed.
Projektet har, ikke overraskende, vist, at SCRUM skal tages for hvad det er og ikke er, samt skal tilpasses til brugergruppen. Daily SCRUM er et essentielt værktøj i frameworket, som gruppen alligevel valgte at fravælge pga gruppens størrelse.
Set i bakspejlet havde Daily hjulpet med at holde den rette kurs i projektet, hvor vi i stedet endte med at køre sur i mindre detaljer, som sagtens kunne have været udskudt ved at dele en ticket op og sylte den besværlige del.


Projektet har understreget vigtigheden af agile metoder og brugercentreret design. Disse erfaringer vil være nyttige i fremtidige projekter, hvor gruppen vil fortsætte med at fokusere på at holde fast i udviklerglæden samt at levere et produkt, der er noget værd for nogen. Det skal være gennem kontinuerlig feedback i gruppearbejde og iterative forbedringer, som afspejler en omstillingsparat proces med gennemtænkte safeties. Samlet set har Fisherman's App-projektet været en lunken succes, der muligvis beviser et Proof of Concept.
Til gengæld fik gruppen hamret betydningen af processer og samarbejde fast.
Det vil sige at til trods for at planlægningsdelen egentlig føltes alt for lang, så skulle den gerne have været længere, sådan at vi ikke var gået i forkerte arbejdsretninger, når det ikke passede.


## Konklusion
Til trods for at F-App-projektet ikke fuldt ud nåede gruppens oprindelige ambitioner, har processen været vigtig for den vores indsigt og erfaring. Det er svært at påstå, vi lærte nye ting om eller gennem SCRUM, men det er under alle omstændigheder blevet cementeret, hvor vitalt det kan være at have en fastlagt proces. 
Det bliver hovedlæren til andre projekter, uanset om vi vælger at arbejde som ansatte eller som iværksættere.

Vi har arbejdet tættere sammen med Product Owner end nogensinde før , og det har været uvurderligt. At PO så oven i købet var den potentielle brugergruppe har kun løftet niveauet for feedback og samarbejde. Som led i processen har dette været en rigtig god prioritering, der ikke altid er nært tilgængelig for et techteam.
Selvom vi stødte på udfordringer (personlige som professionelle) og ikke opnåede alle "fysiske mål" for vores apps kunnen, har vi kunnet gro yderligere som udviklere.

Denne proces har ligeledes understreget betydningen af grundig planlægning og effektivt samarbejde internt i arbejdsgruppen, hvilket sandsynligvis bliver vigtigt for at kunne levere produkter i fremtiden. Med de lektier vi har lært fra dette projekt, føler gruppen sig bedre rustet i tilgangen til både softwareudvikling og idéudvikling.
SCRUM har været meget brugbar og relevant, Supabase og Vue har været gode for udviklergruppen i forståelse og fleksibilitet, og Quasar giver gode byggesten til umiddelbart både UI og UX.
Desuden lagde vi ud med Google Maps men har siden lagt om til Leaflet, som er open source. Det har givet os mere kodearbejde og et ældre look på Map, men vi ønskede at gå uden om Google til en start.
Dette skal genovervejes, fordi det, vi gerne vil slå os på, er innovation og flot design, hvilket Leaflet i denne nuværende udgave ikke er.
