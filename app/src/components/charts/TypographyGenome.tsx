"use client";
import { LineageTree } from "./LineageTree";
import { LANES, NODES, type TypeNode } from "../../../labs/charts/typography/data";

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
/** 1450 to 1800 take a third of the width, 1800 to 2025 the rest: the modern centuries are the dense ones. */
const scale = (y: number) => (y <= 1800 ? ((y - 1450) / 350) * 0.34 : 0.34 + ((y - 1800) / 225) * 0.66);
const TICKS = [1450, 1500, 1600, 1700, 1800, 1850, 1900, 1950, 2000];

export function TypographyGenome() {
  return (
    <LineageTree
      nodes={NODES}
      lanes={LANES}
      years={[1450, 2025]}
      scale={scale}
      ticks={TICKS}
      title="The typography genome, 1455 to today"
      desc="A family tree of Latin type: blackletter, serif, sans serif, monospace and the technology that carries them, with lines showing which styles descend from or were influenced by which."
      posterName="the-typography-genome.svg"
      renderPanel={(node, fam) => {
        const n = node as TypeNode | null;
        if (!n) {
          return (
            <>
              <h2 className="cst-panel-title">Hover a face</h2>
              <p className="cst-panel-what">Every node is a family of type, dated to its first exemplar, drawn in a live stand-in font so you can see the shape, not read about it. Solid lines are descent, dotted lines are influence.</p>
              <p className="cst-panel-why">Two things to notice: the serif lane is one unbroken line from Jenson in 1470, and the technology lane, which starts in 1984, now reaches back into every other lane.</p>
            </>
          );
        }
        return (
          <>
            <p className="cst-panel-kicker">{LANES.find((l) => l.id === n.lane)?.label} · {n.year} · {n.by}</p>
            <h2 className="cst-panel-title">{n.name}</h2>
            <p className="tg-specimen" style={{ fontFamily: `"${n.font}", serif` }} aria-label={`Specimen set in ${n.standIn ?? n.font}`}>
              {n.sample ?? "Hamburgefonstiv"}
              <span className="tg-specimen-small">ABCDEFG abcdefg 0123 &amp; ?</span>
            </p>
            {n.standIn && <p className="tg-standin">Shown in {n.standIn}.</p>}
            <p className="cst-panel-what">{n.what}</p>
            <p className="cst-panel-why">{n.why}</p>
            {fam && (fam.up.length > 0 || fam.down.length > 0) && (
              <p className="cst-panel-fam">
                {fam.up.length > 0 && <>Descends from {fam.up.map((i) => byId[i.id]?.name ?? i.name).join(", ")}. </>}
                {fam.down.length > 0 && <>Led to {fam.down.map((i) => byId[i.id]?.name ?? i.name).join(", ")}.</>}
              </p>
            )}
          </>
        );
      }}
    />
  );
}
