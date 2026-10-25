import MetroTracker from "@/app/MetroTracker";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex flex-col min-h-full justify-start mt-4 items-center gap-4 bg-background  p-2 w-full max-w-175 mx-auto">
      <div className="w-full flex flex-col items-start px-2 gap-4 selection:bg-white selection:text-background">
        <h1 className="text-3xl font-extrabold leading-[120%] text-white text-pretty">
          Quando arriva la metro di Catania?
        </h1>
        <h3 className="text-base leading-[120%] text-white/60 -mt-2">
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
      <MetroTracker />
      <div className="w-full flex flex-col items-start px-2 gap-4 selection:bg-white selection:text-background">
        <h3 className="text-lg leading-[120%] text-white">
          Sito costruito su{" "}
          <Link
            className="underline"
            target="_blank"
            href="https://circumetnea.it/download/orario-metro"
          >
            dati
          </Link>{" "}
          pubblicamente disponibili. Non prevede possibili ritardi, quindi non è
          accurato il 100% delle volte.
        </h3>
        <h3 className="text-sm leading-[120%] text-white/60">
          Per chi volesse sviluppare, è presente una API a /api/quando, che ti
          offre dati come i prossimi due orari e i minuti che mancano ad essi.
        </h3>
      </div>
    </main>
  );
}
