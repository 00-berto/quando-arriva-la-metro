"use client";

import React, { useEffect, useState } from "react";
import localFont from "next/font/local";
import { getTrackerData } from "@/lib/metro-tracker";

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
  " flex items-center justify-between gap-3 bg-[#303030] selection:text-white selection:bg-[#ff8400] px-0 py-0 md:text-3xl text-2xl leading-[120%] tracking-[-0.1rem] whitespace-nowrap text-[#ff8400] [text-shadow:_0px_0px_4px_#ff8400] md:[text-shadow:_0px_0px_8px_#ff8400]";

function formatMinutesRemaining(direction: DirectionSchedule | undefined) {
  return (
    direction?.minutesRemaining
      .map((minutes) => (minutes === 0 ? ">>" : `${minutes}'`))
      .join(", ") || "--"
  );
}

export default function MetroTracker() {
  const [tracker, setTracker] = useState<TrackerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateTracker = () => {
      try {
        setTracker(getTrackerData());
        setError(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Impossibile caricare dati. Riprova più tardi.",
        );
      }
    };

    updateTracker();
    const interval = window.setInterval(updateTracker, 1_000);
    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section
      className="font-doto relative flex h-fit w-full flex-col gap-4 rounded-xl bg-[#202020] p-6"
      aria-label="Orario metro in tempo reale"
    >
      {/* <div className="absolute h-300 w-16 bg-[#202020] top-0 left-4 -translate-y-2/2" />
      <div className="absolute h-300 w-16 bg-[#202020] right-4 top-0 -translate-y-2/2" /> */}
      <div className="w-full flex flex-col gap-4 p-2 rounded-xs bg-[#2a2a2a]">
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
          <span className="text-ellipsis">Monte Po</span>
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
      </div>
    </section>
  );
}
