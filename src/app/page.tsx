import MetroTracker from "@/app/MetroTracker";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex flex-col min-h-screen justify-start mt-4 items-center gap-4 bg-background p-2 w-full max-w-175 mx-auto">
      <MetroTracker />
      <div className="w-full flex flex-col items-start px-2 gap-2">
        <h1 className="text-3xl font-extrabold leading-[120%] text-white text-pretty">
          Quando arriva la metro di Catania?
        </h1>
        <h3 className="text-base leading-[120%] text-white/60">
          by{" "}
          <Link
            href="https://instagram.com/albertocornacchia_"
            className="underline text-white"
            target="_blank"
          >
            berto
          </Link>{" "}
          • Non affiliato con{" "}
          <Link
            href="https://circumetnea.it"
            className="underline text-white"
            target="_blank"
          >
            Ferrovia Circumetnea
          </Link>
        </h3>
      </div>

      <div className="w-full flex flex-col items-start px-2 gap-4">
        <h3 className="text-lg leading-[120%] text-white">
          Questo sito ti permette di visualizzare i tempi stimati di arrivo del
          prossimo treno della Metropolitana di Catania, utilizzando{" "}
          <Link
            className="underline"
            target="_blank"
            href="https://circumetnea.it/download/orario-metro"
          >
            dati pubblicati da Ferrovia Circumetnea
          </Link>
          . Non prevede ritardi, quindi non è accurato il 100% delle volte. È
          soltanto un semplice progetto che ho fatto in una mattinata anziché
          studiare per un interrogazione il giorno dopo.
        </h3>
        <h3 className="text-sm leading-[120%] text-white/60">
          Per chi volesse sviluppare, è presente una API a /api/quando, che ti
          offre dati come i prossimi due orari e i minuti che mancano ad essi.
        </h3>
      </div>
    </main>
  );
}
