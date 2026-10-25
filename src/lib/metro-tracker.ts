import scheduleData from "@/../metro-schedule.json";

const TIME_ZONE = "Europe/Rome";

type ScheduleKey =
  | "mon_thu"
  | "friday"
  | "saturday"
  | "sunday"
  | "holiday_mon_thu"
  | "holiday_friday_saturday";
type StationKey = "monte_po_arrivals" | "stesicoro_departures";
type MetroSchedule = Record<ScheduleKey, Record<StationKey, string[]>>;

const schedule: MetroSchedule = scheduleData;
const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZonedDateParts(date: Date): ZonedDateParts {
  const parts = dateTimeFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getScheduleKey(year: number, month: number, day: number): ScheduleKey {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  if (weekday === 0) return "sunday";
  if (weekday === 5) return "friday";
  if (weekday === 6) return "saturday";
  return "mon_thu";
}

function getZonedTimestamp(parts: ZonedDateParts): number {
  const targetTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  let timestamp = targetTimestamp;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actualParts = getZonedDateParts(new Date(timestamp));
    const representedTimestamp = Date.UTC(
      actualParts.year,
      actualParts.month - 1,
      actualParts.day,
      actualParts.hour,
      actualParts.minute,
      actualParts.second,
    );
    timestamp += targetTimestamp - representedTimestamp;
  }

  return timestamp;
}

function getNextTwo(station: StationKey, now: Date, localNow: ZonedDateParts) {
  const currentMinute = Math.floor(now.getTime() / 60_000) * 60_000;
  const departures: Date[] = [];

  for (let dayOffset = -1; dayOffset <= 1; dayOffset += 1) {
    const serviceDate = new Date(
      Date.UTC(localNow.year, localNow.month - 1, localNow.day + dayOffset),
    );
    const year = serviceDate.getUTCFullYear();
    const month = serviceDate.getUTCMonth() + 1;
    const day = serviceDate.getUTCDate();
    const scheduleKey = getScheduleKey(year, month, day);

    for (const time of schedule[scheduleKey][station]) {
      const [hour, minute] = time.split(":").map(Number);
      const serviceTimeDate = new Date(
        Date.UTC(year, month - 1, day + (hour < 4 ? 1 : 0)),
      );
      const departure = new Date(
        getZonedTimestamp({
          year: serviceTimeDate.getUTCFullYear(),
          month: serviceTimeDate.getUTCMonth() + 1,
          day: serviceTimeDate.getUTCDate(),
          hour,
          minute,
          second: 0,
        }),
      );

      if (departure.getTime() >= currentMinute) departures.push(departure);
    }
  }

  const nextDepartures = departures
    .sort((first, second) => first.getTime() - second.getTime())
    .slice(0, 2);

  return {
    nextTimes: nextDepartures.map((departure) =>
      new Intl.DateTimeFormat("it-IT", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(departure),
    ),
    minutesRemaining: nextDepartures.map((departure) =>
      Math.max(0, Math.ceil((departure.getTime() - now.getTime()) / 60_000)),
    ),
  };
}

export function getTrackerData(now = new Date()) {
  const localNow = getZonedDateParts(now);
  const currentDay = new Intl.DateTimeFormat("it-IT", {
    timeZone: TIME_ZONE,
    weekday: "short",
  })
    .format(now)
    .toLocaleUpperCase("it-IT");
  const currentTime = new Intl.DateTimeFormat("it-IT", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const dateString = new Intl.DateTimeFormat("it-IT", {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  })
    .format(now)
    .toLocaleUpperCase("it-IT");

  return {
    currentDay,
    currentTime,
    dateString,
    stesicoro: getNextTwo("stesicoro_departures", now, localNow),
    montePo: getNextTwo("monte_po_arrivals", now, localNow),
  };
}
