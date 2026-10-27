<img src="/public/favicon.svg" style="width: 128px; height: 128px"><h1 style="font-size: 48px">Quando arriva la metro di Catania?</h1>

Questo sito ti permette di visualizzare i tempi stimati di arrivo del prossimo treno della Metropolitana di Catania, utlilizzando [dati pubblicati da Ferrovia Circumetnea](https://circumetnea.it/download/orario-metro/). Non prevede ritardi, quindi non è accurato il 100% delle volte.

La home page espone i metadati SEO, i dati strutturati `WebSite` e gli endpoint `/robots.txt` e `/sitemap.xml` per i motori di ricerca. L'URL canonico del sito è configurato in `src/app/site.ts`.

## Setup

Scarica l'orario dal [sito di Ferrovia Circumetnea](https://circumetnea.it/download/orario-metro/), piazzalo nella root del progetto, ed esegui `python extract_schedule.py <orario> -o metro-schedule.json` (ricorda di avere tutte le dipendenze installate). Avrai creato un file con tutti gli orari, che dovrai tenere nella root del progetto. Una volta fatto ciò, basta semplicemente iniziare l'app di Next.js con npm run dev!

## Contribuire

Non credo ci sia molto da contribuire, semmai contattatemi se cambiano l'orario e devo adattarmi.
