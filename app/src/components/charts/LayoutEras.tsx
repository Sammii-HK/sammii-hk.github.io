"use client";
import { useState } from "react";

/**
 * The same page built with each generation of CSS layout, in real CSS,
 * rendered by the browser at the width you drag to. What each era could
 * not do is visible in the render, not described.
 */
type Era = { id: string; year: string; name: string; can: string; cannot: string; css: string };
const ERAS: Era[] = [
  { id: "tables", year: "1996", name: "Tables", can: "Columns that line up, equal-height cells, a footer that spans. The only tool that worked in every browser, so every site used it.", cannot: "No reflow: at narrow widths the columns squash rather than stack, and the source order is the visual order for ever. Screen readers announce a spreadsheet.", css: `<table><tr>\n  <td rowspan=2>sidebar</td>\n  <td>main</td>\n</tr></table>` },
  { id: "floats", year: "1998", name: "Floats and clearfix", can: "Real semantic markup; the sidebar can come after the main in the source. Columns via width percentages and float: left.", cannot: "Floats were made for wrapping text round images, not layout: the parent collapses without a clearfix hack, columns are never equal height, and the card grid breaks whenever one card is taller than its neighbour.", css: `.side { float: left; width: 30% }\n.main { float: left; width: 70% }\n.row::after { content: ""; display: table; clear: both }` },
  { id: "inline", year: "2006", name: "inline-block", can: "Cards that wrap like words, vertical-align, no clearing needed.", cannot: "Whitespace between the tags becomes a gap, which is why every inline-block grid has a 4px mystery and a comment saying font-size: 0. Widths still have to add up.", css: `.card { display: inline-block; width: 31%; vertical-align: top }\n.grid { font-size: 0 } /* eat the whitespace */` },
  { id: "flex", year: "2013", name: "Flexbox", can: "Equal-height columns for free, alignment in both axes, order without touching the source, space distributed rather than calculated. Layout stopped being arithmetic.", cannot: "One dimension at a time. The card grid wraps, but the rows do not know about each other: the last row stretches or leaves a gap, and nothing lines up across rows.", css: `.page { display: flex }\n.side { flex: 0 0 30% }\n.grid { display: flex; flex-wrap: wrap; gap: 8px }\n.card { flex: 1 1 30% }` },
  { id: "grid", year: "2017", name: "Grid", can: "Two dimensions, named areas, rows and columns that know about each other, auto-fill columns that add and remove themselves as the width changes. The page is a drawing again.", cannot: "The cards still respond to the viewport, not to the space they are actually in: the same card component in a narrow sidebar has no way to know it is narrow.", css: `.page { display: grid;\n  grid-template-areas: "head head" "side main" "foot foot";\n  grid-template-columns: 30% 1fr }\n.grid { display: grid; gap: 8px;\n  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) }` },
  { id: "cq", year: "2022", name: "Container queries", can: "A card asks how wide its container is and lays itself out accordingly: horizontal in the main column, stacked in the sidebar, the same component both times. Responsive stops meaning viewport.", cannot: "Card interiors still do not line up with each other: each card's title and price sit where that card's content puts them.", css: `.cell { container-type: inline-size }\n@container (min-width: 150px) {\n  .card { grid-template-columns: 34px 1fr auto } }` },
  { id: "subgrid", year: "2023", name: "Subgrid", can: "A card's internal rows join the parent grid's rows, so titles, bodies and prices align across every card in a row however long the text is.", cannot: "Little, for this page. What is left is anchoring popovers to the thing they belong to (anchor positioning, 2024), and that is a different chart.", css: `.cell { display: grid; grid-row: span 4;\n  grid-template-rows: subgrid }\n.card { display: contents }` },
];

const CARDS = [
  { t: "Sunrise", b: "Short.", p: "£4" },
  { t: "A much longer title that wraps", b: "The body of this one runs to two or three lines so the heights differ.", p: "£12" },
  { t: "Noon", b: "One line.", p: "£7" },
  { t: "Dusk", b: "Two lines of copy here, enough to push the price down a little.", p: "£9" },
  { t: "Night", b: "Short.", p: "£3" },
];

export function LayoutEras() {
  const [era, setEra] = useState<Era>(ERAS[4]);
  const [w, setW] = useState(100);
  const Card = ({ c }: { c: typeof CARDS[number] }) => <div className="ly-cell"><div className="ly-card"><span className="ly-thumb" /><b className="ly-t">{c.t}</b><p className="ly-b">{c.b}</p><i className="ly-p">{c.p}</i></div></div>;
  const cards = CARDS.map((c, i) => <Card key={i} c={c} />);

  return (
    <div className="ly">
      <div className="ly-eras" role="tablist" aria-label="Layout era">
        {ERAS.map((e) => <button key={e.id} role="tab" type="button" aria-selected={era.id === e.id} className={`ly-era ${era.id === e.id ? "is-on" : ""}`} onClick={() => setEra(e)}><span className="ly-era-year">{e.year}</span><span className="ly-era-name">{e.name}</span></button>)}
      </div>
      <label className="cst-year">
        <span className="cst-year-label">Container width</span>
        <input type="range" min={30} max={100} value={w} onChange={(e) => setW(Number(e.target.value))} aria-valuetext={`${w} percent`} />
        <output className="cst-year-value">{w}%</output>
      </label>
      <div className="ly-frame">
        <div className={`ly-page ly-page--${era.id}`} style={{ width: `${w}%` }}>
          {era.id === "tables" ? (
            <table className="ly-table"><tbody>
              <tr><td colSpan={2} className="ly-head">Header</td></tr>
              <tr><td className="ly-side">Sidebar<div className="ly-grid">{cards.slice(0, 2)}</div></td><td className="ly-main">Main<table className="ly-table ly-table--grid"><tbody><tr>{cards.slice(0, 3).map((c, i) => <td key={i}>{c}</td>)}</tr><tr>{cards.slice(3).map((c, i) => <td key={i}>{c}</td>)}<td /></tr></tbody></table></td></tr>
              <tr><td colSpan={2} className="ly-foot">Footer</td></tr>
            </tbody></table>
          ) : (<>
            <div className="ly-head">Header</div>
            <div className="ly-row">
              <div className="ly-side">Sidebar<div className="ly-grid">{cards.slice(0, 2)}</div></div>
              <div className="ly-main">Main<div className="ly-grid">{cards}</div></div>
            </div>
            <div className="ly-foot">Footer</div>
          </>)}
        </div>
      </div>
      <div className="ly-info">
        <div>
          <p className="cst-panel-kicker">What {era.year} could do</p>
          <p className="ly-p-text">{era.can}</p>
          <p className="cst-panel-kicker" style={{ marginTop: "0.8rem" }}>What it could not</p>
          <p className="ly-p-text">{era.cannot}</p>
        </div>
        <pre className="ly-code"><code>{era.css}</code></pre>
      </div>
    </div>
  );
}
