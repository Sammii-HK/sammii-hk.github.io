"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Why the week goes Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn when
 * the planets are ordered Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon:
 * 24 hours, seven rulers, 24 mod 7 = 3. Step the hours and the heptagram
 * draws itself. Then the seven-fold correspondences underneath it, laid
 * out so each column reads down.
 */
const CHALDEAN = [
  { planet: "Saturn", day: "Saturday", sym: "♄", from: "Saturn's day" },
  { planet: "Jupiter", day: "Thursday", sym: "♃", from: "Thor's day, jeudi (Jovis dies)" },
  { planet: "Mars", day: "Tuesday", sym: "♂", from: "Tiw's day, mardi (Martis dies)" },
  { planet: "Sun", day: "Sunday", sym: "☉", from: "Sun's day" },
  { planet: "Venus", day: "Friday", sym: "♀", from: "Frigg's day, vendredi (Veneris dies)" },
  { planet: "Mercury", day: "Wednesday", sym: "☿", from: "Woden's day, mercredi (Mercurii dies)" },
  { planet: "Moon", day: "Monday", sym: "☾", from: "Moon's day" },
];
const R = 140, CX = 250, CY = 190;
const pos = (i: number) => { const a = (-Math.PI / 2) + (i / 7) * Math.PI * 2; return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }; };

const ROWS: { name: string; cells: string[]; note: string }[] = [
  { name: "Newton's spectrum", cells: ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet"], note: "Opticks, 1704. Newton saw a continuum and chose seven divisions to match the seven notes of the scale; indigo is there to make the count." },
  { name: "The scale", cells: ["C", "D", "E", "F", "G", "A", "B"], note: "Seven notes of the diatonic scale, which is what Newton was matching." },
  { name: "The week", cells: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], note: "In the order the heptagram above produces." },
  { name: "Its planets", cells: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"], note: "The seven classical planets: the bodies that visibly move against the fixed stars." },
  { name: "The chakras", cells: ["Root", "Sacral", "Solar plexus", "Heart", "Throat", "Third eye", "Crown"], note: "Seven in the modern Western scheme, coloured red to violet in that scheme since the twentieth century." },
  { name: "A Journey Through Light", cells: ["Death & Regeneration", "Consciousness & The Body", "Ancient Wisdom", "Hermetic Foundations", "Mythology as Code", "Perception & Invisible Realities", "Ascent & Unity"], note: "The seven spheres of my MA installation (2018), one per colour of the spectrum, the audience walking from darkness through the seven into ultraviolet." },
];

const COUNTS: { n: string; what: string; src: string }[] = [
  { n: "7 ± 2", what: "items a person can hold in working memory, in Miller's famous estimate", src: "Miller, 1956" },
  { n: "1 in 10", what: "people name seven as their favourite number, the most popular answer in Alex Bellos's 44,000-person survey. His reason: of the first ten numbers it is the only one you can neither multiply nor divide within the group", src: "Bellos, 2014" },
  { n: "7", what: "heavens in Judaism and Islam, with God above the seventh; seven circuits of the Kaaba; seven wedding blessings", src: "MA research, 2018" },
  { n: "7", what: "higher worlds and seven underworlds in Hinduism; seven horses pull the sun god's chariot; seven gods of fortune in Japan", src: "MA research, 2018" },
  { n: "7", what: "planetary spheres the soul descends through in the Hermetica, which is where the week, the metals and the days all inherit the count", src: "Corpus Hermeticum; Black, 2010" },
];

export function Seven() {
  const [hour, setHour] = useState(0); // 0..167, hour 0 = first hour of Saturday, ruled by Saturn
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  useEffect(() => { const p = new URLSearchParams(window.location.search); if (p.get("play") === "1") setPlaying(true); }, []);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (t: number) => { if (t - last > 70) { last = t; setHour((h) => (h + 1) % 168); } raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);
  const ruler = hour % 7; const day = Math.floor(hour / 24); const hourOfDay = hour % 24;
  const dayStarts = useMemo(() => Array.from({ length: Math.min(7, day + 1) }, (_, d) => (d * 24) % 7), [day]);
  const starPath = dayStarts.map((i, k) => `${k ? "L" : "M"}${pos(i).x.toFixed(1)} ${pos(i).y.toFixed(1)}`).join(" ") + (day >= 6 && hourOfDay === 23 ? ` L${pos(0).x.toFixed(1)} ${pos(0).y.toFixed(1)}` : "");

  return (
    <div className="sv">
      <div className="sv-top">
        <svg className="sv-svg" viewBox="0 0 500 380" role="img" aria-label="The seven classical planets in Chaldean order around a circle; stepping 24 hours at a time draws a seven-pointed star in the order of the days of the week">
          <circle cx={CX} cy={CY} r={R} className="sv-ring" />
          {dayStarts.length > 1 && <path d={starPath} className="sv-star" />}
          {CHALDEAN.map((p, i) => { const { x, y } = pos(i); const lit = i === ruler; const started = dayStarts.includes(i); return (
            <g key={p.planet} className={`sv-node ${lit ? "is-lit" : ""} ${started ? "is-day" : ""}`} transform={`translate(${x} ${y})`}>
              <circle r={lit ? 16 : 12} />
              <text className="sv-sym" dy="5">{p.sym}</text>
              <text className="sv-name" y={y < CY - 20 ? -24 : y > CY + 20 ? 34 : 6} x={x < CX - 20 ? -22 : x > CX + 20 ? 22 : 0} textAnchor={x < CX - 20 ? "end" : x > CX + 20 ? "start" : "middle"}>{p.planet}{started ? ` · ${p.day.slice(0, 3)}` : ""}</text>
            </g>); })}
          <text x={CX} y={CY - 8} textAnchor="middle" className="sv-centre-day">{CHALDEAN[(day * 24) % 7].day}</text>
          <text x={CX} y={CY + 14} textAnchor="middle" className="sv-centre-hour">hour {hourOfDay + 1} · ruled by {CHALDEAN[ruler].planet}</text>
        </svg>
        <div className="sv-side">
          <p className="cst-panel-kicker">The mechanism</p>
          <p className="sv-p">Put the seven classical planets in the ancients&rsquo; order, slowest to fastest across the sky: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon. Give each hour of the day to the next planet in that order, round and round. A day has 24 hours, and 24 mod 7 = 3, so the planet ruling the first hour of each new day is three steps on from the one before. Follow the first hours and you get Saturn, Sun, Moon, Mars, Mercury, Jupiter, Venus: the week. Drawn on the circle, that step of three is the {"{7/3}"} heptagram.</p>
          <div className="sv-controls">
            <button type="button" className="cst-btn" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Step the hours"}</button>
            <button type="button" className="cst-btn" onClick={() => { setPlaying(false); setHour(0); }}>Reset</button>
            <label className="cst-year"><span className="cst-year-label">Hour of the week</span><input type="range" min={0} max={167} value={hour} onChange={(e) => { setPlaying(false); setHour(Number(e.target.value)); }} /><output className="cst-year-value">{hour + 1}</output></label>
          </div>
          <p className="sv-p sv-p--small">The names are the same seven gods in every European language that kept them: {CHALDEAN[(day * 24) % 7].from}.</p>
        </div>
      </div>

      <h3 className="ct-h">Seven, in columns</h3>
      <div className="sv-table-wrap">
        <table className="sv-table">
          <thead><tr><th scope="col">Set</th>{[1, 2, 3, 4, 5, 6, 7].map((i) => <th key={i} scope="col">{i}</th>)}</tr></thead>
          <tbody>
            {ROWS.map((r) => <tr key={r.name}><th scope="row">{r.name}<span>{r.note}</span></th>{r.cells.map((c, i) => <td key={i} className={`sv-c${i}`}><span>{c}</span></td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <p className="jd-note">The rows are not claimed to correspond, only to count. The spectrum and the scale do, historically: Newton picked seven bands so light and music would share a number. The week and its planets do, mechanically, as above. The rest is seven because seven had already become the number you reach for when you want a set to feel complete.</p>

      <h3 className="ct-h">Seven, counted</h3>
      <ul className="sv-counts">
        {COUNTS.map((c, i) => <li key={i}><b>{c.n}</b><span>{c.what}. <em>{c.src}</em></span></li>)}
      </ul>
    </div>
  );
}
