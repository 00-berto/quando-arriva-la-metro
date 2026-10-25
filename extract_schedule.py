import json
import re

import pypdf


TIME_PATTERN = re.compile(r"(?<!\d)(\d)\s*(\d)\s*:\s*(\d)\s*(\d)(?!\d)")
TIMETABLE_ROW_PATTERN = re.compile(
    r"^(MONTE\s+PO|STESICORO)\s+(PART|ARR)\.",
    re.IGNORECASE,
)
SCHEDULE_SECTIONS = (
    (
        "friday",
        "ORARIO FERIALE CORSE METRO NELLE GIORNATE DI VENERDI",
        ("MONTE PO", "MONTE PO", "STESICORO", "STESICORO"),
    ),
    (
        "mon_thu",
        "ORARIO FERIALE CORSE METRO DAL LUNEDI AL GIOVEDI",
        ("MONTE PO", "MONTE PO", "STESICORO", "STESICORO"),
    ),
    (
        "saturday",
        "ORARIO FERIALE CORSE METRO NELLE GIORNATE DI SABATO",
        ("MONTE PO", "STESICORO"),
    ),
    (
        "sunday",
        "ORARIO CORSE METRO NELLE GIORNATE DI DOMENICA",
        ("MONTE PO", "STESICORO"),
    ),
    (
        "holiday_friday_saturday",
        "ORARIO FESTIVO CORSE METRO NELLE GIORNATE DI VENERDI O SABATO",
        ("MONTE PO", "STESICORO"),
    ),
    (
        "holiday_mon_thu",
        "ORARIO FESTIVO CORSE METRO DAL LUNEDI AL GIOVEDI",
        ("MONTE PO", "STESICORO"),
    ),
)
def normalize_heading(value):
    return re.sub(r"[^A-Z0-9]+", " ", value.upper()).strip()


def extract_times(line):
    times = []
    for match in TIME_PATTERN.finditer(line):
        hours = int(match.group(1) + match.group(2))
        minutes = int(match.group(3) + match.group(4))
        if hours > 23 or minutes > 59:
            raise ValueError(f"Invalid departure time in PDF row: {match.group(0)}")
        times.append(f"{hours:02}:{minutes:02}")
    return times


def generate_metro_json(pdf_path, output_json_path):
    reader = pypdf.PdfReader(pdf_path)
    if len(reader.pages) != 1:
        raise ValueError(f"Expected a one-page timetable PDF, found {len(reader.pages)} pages")

    lines = reader.pages[0].extract_text().splitlines()
    headings = {
        normalize_heading(line)
        for line in lines
        if line.upper().startswith("ORARIO ")
    }
    missing_headings = [
        heading
        for _, heading, _ in SCHEDULE_SECTIONS
        if normalize_heading(heading) not in headings
    ]
    if missing_headings:
        raise ValueError(f"Timetable headings missing from PDF: {missing_headings}")

    departure_rows = []
    for line_index, line in enumerate(lines):
        match = TIMETABLE_ROW_PATTERN.match(line.strip())
        if match and match.group(2).upper() == "PART":
            station = " ".join(match.group(1).upper().split())
            times = extract_times(line)
            if not times:
                raise ValueError(f"No departure times found in PDF row: {line}")
            departure_rows.append((line_index, station, times))

    schedule = {}
    row_index = 0
    for section, _, expected_stations in SCHEDULE_SECTIONS:
        section_rows = departure_rows[row_index : row_index + len(expected_stations)]
        actual_stations = tuple(station for _, station, _ in section_rows)
        if actual_stations != expected_stations:
            raise ValueError(
                f"Unexpected departure rows for {section}: "
                f"expected {expected_stations}, found {actual_stations}"
            )

        schedule[section] = {
            "monte_po_arrivals": [],
            "stesicoro_departures": [],
        }

        start_line = section_rows[0][0]
        end_line = section_rows[-1][0]
        for line in lines[start_line : end_line + 2]:
            match = TIMETABLE_ROW_PATTERN.match(line.strip())
            if not match:
                continue

            station = " ".join(match.group(1).upper().split())
            row_type = match.group(2).upper()
            if station == "MONTE PO" and row_type == "ARR":
                schedule[section]["monte_po_arrivals"].extend(extract_times(line))

        for _, station, times in section_rows:
            if station == "STESICORO":
                schedule[section]["stesicoro_departures"].extend(times)

        for station_key, times in schedule[section].items():
            if not times:
                raise ValueError(f"No timetable values found for {section}.{station_key}")
        if len(schedule[section]["monte_po_arrivals"]) != len(
            schedule[section]["stesicoro_departures"]
        ):
            raise ValueError(f"Departure and arrival counts do not match for {section}")

        row_index += len(expected_stations)

    if row_index != len(departure_rows):
        raise ValueError(
            f"Found {len(departure_rows) - row_index} unassigned departure rows in PDF"
        )

    with open(output_json_path, "w", encoding="utf-8") as output_file:
        json.dump(schedule, output_file, indent=2, ensure_ascii=False)
        output_file.write("\n")

    print(f"Generated timetable data for {len(schedule)} schedule sections.")


if __name__ == "__main__":
    generate_metro_json(
        "ORARIO-METRO-ANALITICO-MONTEPO-FONTANA-24.pdf",
        "metro-schedule.json",
    )
