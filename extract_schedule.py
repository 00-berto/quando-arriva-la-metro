"""
Parse the Circumetnea metro timetable PDF and write metro-schedule.json.
 
Output format (one object per service type):
 
{
  "mon_thu": {
    "monte_po_arrivals":    ["06:45", ...],   # arrival at Monte Po (trains from Stesicoro)
    "stesicoro_departures": ["06:25", ...]    # departure from Stesicoro (same trains, same order)
  },
  "friday": {...}, "saturday": {...}, "sunday": {...},
  "holiday_mon_thu": {...}, "holiday_friday_saturday": {...}
}
 
Usage:
    python pdf_to_metro_json.py ORARIO-METRO-....pdf [-o metro-schedule.json]
 
Requires: pdfplumber  (pip install pdfplumber)
"""
import argparse
import json
import re
import sys
from collections import defaultdict
 
import pdfplumber
 
TIME_RE = re.compile(r"^\d{2}:\d{2}$")
 
# Section heading text -> JSON key. Order matters (first match wins).
SECTIONS = [
    (re.compile(r"FERIALE.*LUNED.*GIOVED", re.I), "mon_thu"),
    (re.compile(r"FERIALE.*VENERD", re.I), "friday"),
    (re.compile(r"FERIALE.*SABATO", re.I), "saturday"),
    (re.compile(r"FESTIVO.*LUNED.*GIOVED", re.I), "holiday_mon_thu"),
    (re.compile(r"FESTIVO.*(VENERD|SABATO)", re.I), "holiday_friday_saturday"),
    (re.compile(r"DOMENICA", re.I), "sunday"),
]
OUTPUT_ORDER = [
    "friday", "mon_thu", "saturday", "sunday",
    "holiday_friday_saturday", "holiday_mon_thu",
]
 
 
def group_lines(words, y_tol=3.0):
    """Group pdfplumber words into text lines by vertical position.
 
    Words are clustered by *consecutive* distance in `top` (not by fixed
    buckets), so a row whose label and times differ by a fraction of a point
    still ends up on the same line.
    """
    words = sorted(words, key=lambda w: w["top"])
    clusters, last_top = [], None
    for w in words:
        if last_top is None or w["top"] - last_top > y_tol:
            clusters.append([])
        clusters[-1].append(w)
        last_top = w["top"]
    lines = []
    for ws in clusters:
        ws = sorted(ws, key=lambda w: w["x0"])
        lines.append({"top": ws[0]["top"], "words": ws,
                      "text": " ".join(w["text"] for w in ws)})
    return lines
 
 
def section_key(text):
    if "ORARIO" not in text.upper():
        return None
    for rx, key in SECTIONS:
        if rx.search(text):
            return key
    return None
 
 
def row_times(line):
    """Times in a row, ignoring the leading label (e.g. 'STESICORO PART.')."""
    return [w["text"] for w in line["words"] if TIME_RE.match(w["text"])]
 
 
def parse(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        lines = []
        for page in pdf.pages:
            words = page.extract_words(x_tolerance=1, y_tolerance=1)
            lines.extend(group_lines(words))
 
    data = {k: {"departures": [], "arrivals": []} for k in OUTPUT_ORDER}
    current = None
    pending = None  # departures row waiting for its matching arrivals row
 
    for ln in lines:
        text = ln["text"].upper()
 
        key = section_key(ln["text"])
        if key:
            current = key
            continue
        if current is None:
            continue
 
        # Only the Stesicoro -> Monte Po direction is stored in the JSON.
        if text.startswith("STESICORO") and "PART" in text:
            pending = row_times(ln)
        elif text.startswith("MONTE PO") and "ARR" in text and pending is not None:
            arrivals = row_times(ln)
            if len(arrivals) != len(pending):
                sys.exit(f"[{current}] departures/arrivals length mismatch: "
                         f"{len(pending)} vs {len(arrivals)}")
            data[current]["departures"] += pending
            data[current]["arrivals"] += arrivals
            pending = None
 
    out = {}
    for key in OUTPUT_ORDER:
        d = data[key]
        if not d["departures"]:
            sys.exit(f"No data found for section '{key}' - PDF layout changed?")
        out[key] = {
            "monte_po_arrivals": d["arrivals"],
            "stesicoro_departures": d["departures"],
        }
    return out
 
 
def validate(schedule):
    """Sanity checks; prints warnings (never alters the data)."""
    def mins(t):
        h, m = map(int, t.split(":"))
        return h * 60 + m
 
    for key, d in schedule.items():
        dep, arr = d["stesicoro_departures"], d["monte_po_arrivals"]
 
        # Every trip should take the same time (20 min in this timetable).
        trips = {(mins(a) - mins(s)) % 1440 for s, a in zip(dep, arr)}
        if trips != {20}:
            print(f"warning [{key}]: unusual trip durations (min): {sorted(trips)}",
                  file=sys.stderr)
 
        # Times must increase through the day; after-midnight values (00:xx, 01:xx)
        # are allowed to wrap exactly once.
        wraps = sum(mins(b) < mins(a) for a, b in zip(dep, dep[1:]))
        if wraps > 1:
            print(f"warning [{key}]: departures not monotonic", file=sys.stderr)
 
 
def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf")
    ap.add_argument("-o", "--output", default="metro-schedule.json")
    args = ap.parse_args()
 
    schedule = parse(args.pdf)
    validate(schedule)
    with open(args.output, "w", encoding="utf-8", newline="\r\n") as f:
        json.dump(schedule, f, indent=2)
    for k, v in schedule.items():
        print(f"{k:24s} {len(v['stesicoro_departures'])} trips")
    print(f"written -> {args.output}")
 
 
if __name__ == "__main__":
    main()
    """grazie claudio"""
 