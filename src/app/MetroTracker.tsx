"use client";

import React, { useEffect, useState } from "react";
import localFont from "next/font/local";
import Image from "next/image";

interface DirectionSchedule {
  nextTimes: string[];
  minutesRemaining: number[];
}

interface TrackerResponse {
  currentDay: string;
  currentTime: string;
  stesicoro: DirectionSchedule;
  montePo: DirectionSchedule;
}

const doto = localFont({
  src: "../../public/aesys-font.otf",
});

const displayRowClassName =
  doto.className +
  " flex items-center justify-between gap-3 bg-[#303030] px-1 py-2 md:text-3xl text-2xl leading-[120%] whitespace-nowrap text-[#ff9900] [text-shadow:_0px_0px_5px_#ff9900]";

function formatMinutesRemaining(direction: DirectionSchedule | undefined) {
  return (
    direction?.minutesRemaining
      .map((minutes) => (minutes === 0 ? "ARRIVO" : `${minutes}'`))
      .join(", ") || "--"
  );
}

export default function MetroTracker() {
  const [tracker, setTracker] = useState<TrackerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const updateTracker = async () => {
      try {
        const response = await fetch("/api/quando", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          const resJson = await response.json();
          throw new Error(
            `${resJson.error ?? "Impossibile caricare dati. Riprova più tardi."} (${response.status})`,
          );
        }

        const data: TrackerResponse = await response.json();
        setTracker(data);
        setError(null);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load metro timetable",
        );
      }
    };

    void updateTracker();
    const interval = window.setInterval(() => void updateTracker(), 15_000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section
      className="font-doto flex h-fit w-full flex-col gap-2 rounded-lg bg-[#202020] p-[clamp(16px,3vw,26px)]"
      aria-label="Orario metro in tempo reale"
    >
      <div className={displayRowClassName}>
        <span className="text-ellipsis">{tracker?.currentDay ?? "--"}</span>
        <time className="flex-none text-right">
          {tracker?.currentTime ?? "--:--"}
        </time>
      </div>

      <div className={displayRowClassName}>
        <span className="text-ellipsis">Stesicoro</span>
        <span
          className="flex-none text-right tracking-normal"
          aria-label={`Prossime partenze da Stesicoro: ${
            tracker?.stesicoro.nextTimes.join(", ") || "non disponibili"
          }`}
        >
          {formatMinutesRemaining(tracker?.stesicoro)}
        </span>
      </div>

      <div className={displayRowClassName}>
        <span className="text-ellipsis">Monte Po&apos;</span>
        <span
          className="flex-none text-right tracking-normal"
          aria-label={`Prossimi arrivi a Monte Po: ${
            tracker?.montePo.nextTimes.join(", ") || "non disponibili"
          }`}
        >
          {formatMinutesRemaining(tracker?.montePo)}
        </span>
      </div>

      {error && (
        <p className="font-sans text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
