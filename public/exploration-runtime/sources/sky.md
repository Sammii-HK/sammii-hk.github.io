# Sky exhibits: sources and model notes

All three exhibits run without runtime network calls, external fonts, dependencies or image assets. Outbound source links open only if the reader chooses them. The drawings and layout are original. The existing D3 map on the user's MacBook has not been accessed or reused.

## Integration

Load `sky.css` and `sky.js`, then call:

```js
const cleanup = window.SkyExhibits.mount('stories', container);
// Other modes: 'time', 'depth'. Call cleanup() before replacing an exhibit.
```

`mount` appends one owned section. Cleanup cancels animation, disconnects ResizeObserver / resize fallback, removes the canvas listener and removes that section. Each mount has independent controls, IDs and state. A guarded CommonJS export exposes `model` for Node tests without touching browser globals.

## Coverage in this expansion

- **One Sky:** all **88 modern constellations**, a searchable chooser, and separate **Illustration / Lines / Stars** display modes. Every constellation has an original procedural figure study. These are contemporary interpretations of the figure names, not reproductions of historic plates.
- **Sky Unravelling:** the same 88 selectable patterns, with **756 unique stars** carrying measured proper motions. There are **742 retained line segments**, playback, a ±100,000-year slider, original-pattern comparison, trails, zoom/refit and numerical star inspection.
- **Depth:** the original **seven Big Dipper stars**, deliberately retained as a focused high-significance-parallax sample. Its scope is stated in the figure and numerical details.
- **Separate attributed accounts:** Matariki, the Greek Seven Sisters, and the Kamilaroi/Euahlayi Celestial Emu. These remain specifically scoped and are not presented as complete alternative all-sky catalogues.

The culture/sky-pattern selector is separate from the modern-figure display selector. Choosing a line view does not change the underlying star catalogue or cultural account. Every measured point is inspectable through pointer hover, a tap, or a keyboard-accessible star chooser. Tiny background points remain decorative and are explicitly labelled.

## 1. One Sky, Many Stories

The two Pleiades accounts and the Celestial Emu account are intentionally concise, attributed summaries. We do not claim to represent every Greek, Māori or Aboriginal tradition. There are no generated traditional narratives, sacred texts, copied artworks or invented traditional boundaries.

### Te Papa: Matariki

- Regional variation and iwi context: <https://www.tepapa.govt.nz/digital-museum/explore-digital-museum/matariki-maori-new-year/matariki-regional-variations/matariki>
- Te Papa's nine named stars and spelling used here: <https://www.tepapa.govt.nz/digital-museum/explore-digital-museum/matariki-maori-new-year/what-and-who-matariki>
- Additional regional context: <https://www.tepapa.govt.nz/digital-museum/explore-digital-museum/matariki-maori-new-year/matariki-regional-variations>

The museum acknowledges seven-star and nine-star accounts and its engagement with participating iwi. These recognised groups must not be confused with the physical cluster's full stellar population. The diagram does not map Māori names onto individual physical stars.

### Greek Seven Sisters

- NASA/JPL's summary identifies Atlas and Pleione and their seven daughters: <https://www.jpl.nasa.gov/images/pia09263-the-seven-sisters-pose-for-spitzer/>

Only that basic naming account is paraphrased. The nine decorative points are an original, idealised cluster layout, not a catalogue-derived Pleiades map. Seven are highlighted in the Seven Sisters view; no Greek constellation boundary is claimed. The interface explicitly labels the schematic and does not imply a star-by-star correspondence between accounts.

### Celestial Emu

- Ngarrngga, *Case Study 1: The Celestial Emu*: <https://www.ngarrngga.org/case-study/case-study-1-the-celestial-emu>

The exhibit specifically attributes the account described for Kamilaroi and Euahlayi peoples. Ngarrngga discusses related community variations, dark regions of the Milky Way and connections between changing evening orientation and emu behaviour. The drawing is an original negative-space schematic. Rotation is an art interaction, **not** a computed local sky, season, calendar or traditional boundary. No photograph or source illustration is reproduced.

## 2–3. Shared measured star catalogue

The modern-figure and time views share 756 measured stars with stable HIP IDs. Depth uses seven of those same objects: the familiar Big Dipper stars. The seven values agree exactly between the expanded and original samples. A line guide is a visual convention, not a physical connection between stars.

The source is the **original ESA 1997 Hipparcos Main Catalogue**, not Gaia and not the later 2007 Hipparcos reduction. The first seven records were downloaded directly from ESA's catalogue service. The expanded sample was downloaded on 2026-11-12 as eight TSV batches from the CDS/VizieR Harvard mirror, table `I/239/hip_main`. All eight successful original responses, including query URL, catalogue identity, field descriptions and coordinate epoch, are retained as `data/hipparcos-catalogue-00.tsv` through `-07.tsv`. The browser uses embedded numeric data and never downloads these files.

The first sample remains in `data/hipparcos-sample.json`, with original ESA HTML responses in `data/hip-*.html`. Those independent records continue to regression-test seven stars against the expanded sample.

### Topology, names and reproducible extraction

The constellation geometry is Olaf Frohn's **D3 Celestial** data, downloaded 2026-11-12:

- Repository and documented upstream sources: <https://github.com/ofrohn/d3-celestial>
- Geometry: <https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json>
- HIP-ID coordinate matching: <https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/stars.8.json>
- Constellation names: <https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.json>
- Star names/designations: <https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/starnames.json>
- Original BSD 3-Clause licence: <https://github.com/ofrohn/d3-celestial/blob/master/LICENSE>

D3 Celestial documents its star positions as J2000, derived from XHIP, and its constellation guides as adapted from IAU constellation-page figures. **We use those coordinates only to identify the HIP ID of each line endpoint.** All 757 distinct endpoints matched exactly and unambiguously to one D3 Celestial star. We then retrieve the original Hipparcos astrometry for those HIP IDs; the rendered positions and time origin are J1991.25. We do not silently mix J2000 geometry with J1991.25 motions.

The source has 89 figure entries because Serpens is represented by two disconnected parts. We merge its two parts into one selectable Serpens entry, preserving their line topology. The result is 88 distinct constellation IDs.

One source endpoint, **Alula Australis / HIP 55203**, has no astrometric solution in the original catalogue. Its RA, Dec, parallax and proper-motion cells are blank. It and its one incident segment are omitted in both modern views, and the Ursa Major description explicitly discloses this. We do not interpolate it or give it zero/fabricated motion. The raw topology has 743 segments; 742 remain. `catalogue.json` and the model retain its exclusion reason.

One retained star, **HIP 37677**, has a negative measured parallax (−0.37 mas). Its sky position and measured proper motion are usable for the time illustration; a distance is not inferred. Another 66 stars have positive parallaxes below five times their reported errors, for 67 measurements below the five-sigma threshold in total. The interface calls those positive-parallax distances poorly constrained rather than manufacturing a confident distance. The depth exhibit continues using its seven high-significance parallaxes.

`build_catalogue.py` reconstructs `data/catalogue.json`, the exact-coordinate endpoint evidence, source SHA-256 hashes and the embedded catalogue in `sky.js`. It uses retained evidence without a network call by default; `--fetch` only retrieves missing or invalid Hipparcos batches. Original upstream files remain under `data/d3-*`. Content hashes in `data/source-sha256.json` pin the downloaded evidence even if upstream master branches change.

### Attribution and licences

The D3 Celestial topology/name data are redistributed under the **BSD 3-Clause licence, © 2015 Olaf Frohn**. Its unmodified full notice is retained in `data/D3-LICENSE.txt`, embedded in the standalone JavaScript, and available in the exhibit's sources disclosure. Only endpoint IDs and selected names are used at runtime; the D3 rendering library is not bundled.

Numeric astrometry is attributed to **ESA (1997), The Hipparcos and Tycho Catalogues, ESA SP-1200**, delivered by CDS/VizieR, catalogue I/239. The TSV metadata records the publisher and its rights-policy link: <https://cds.unistra.fr/vizier-org/licences_vizier.html>. The original catalogue is a publicly accessible scientific source; this project does not relabel its measurements as BSD-licensed or claim they are public domain. The NASA HEASARC documentation is used to verify definitions, units and provenance.

The procedural drawings, interaction code and account summaries are original. The cultural-source prose, photographs and source illustrations are not copied or bundled.

| Star | HIP identifier | Original record |
|---|---|---|
| Dubhe | 54061 | <https://hipparcos-tools.cosmos.esa.int/cgi-bin/HIPcatalogueSearch.pl?hipId=54061> |
| Merak | 53910 | <https://hipparcos-tools.cosmos.esa.int/cgi-bin/HIPcatalogueSearch.pl?hipId=53910> |
| Phecda | 58001 | <https://hipparcos-tools.cosmos.esa.int/cgi-bin/HIPcatalogueSearch.pl?hipId=58001> |
| Megrez | 59774 | <https://hipparcos-tools.cosmos.esa.int/cgi-bin/HIPcatalogueSearch.pl?hipId=59774> |
| Alioth | 62956 | <https://hipparcos-tools.cosmos.esa.int/cgi-bin/HIPcatalogueSearch.pl?hipId=62956> |
| Mizar | 65378 | <https://hipparcos-tools.cosmos.esa.int/cgi-bin/HIPcatalogueSearch.pl?hipId=65378> |
| Alkaid | 67301 | <https://hipparcos-tools.cosmos.esa.int/cgi-bin/HIPcatalogueSearch.pl?hipId=67301> |

Catalogue / field descriptions:

- ESA catalogue field guide: <https://hipparcos-tools.cosmos.esa.int/pstex/sect2_01.pdf>
- NASA HEASARC's documentation of the same original catalogue: <https://heasarc.gsfc.nasa.gov/w3browse/star-catalog/hipparcos.html>
- CDS/VizieR original catalogue I/239: <https://vizier.cds.unistra.fr/viz-bin/VizieR-3?-source=I%2F239>

### Units and conventions

| Field | Definition |
|---|---|
| H8 / `raDeg` | ICRS right ascension in degrees, at epoch J1991.25 |
| H9 / `decDeg` | ICRS declination in degrees, at epoch J1991.25 |
| H11 / `parallaxMas` | Trigonometric parallax, milliarcseconds |
| H12 / `pmRaCosDecMasYr` | μRA* = μRA cos(dec), milliarcseconds/year |
| H13 / `pmDecMasYr` | Declination proper motion, milliarcseconds/year |
| H16 / `parallaxErrorMas` | Catalogue parallax standard error, milliarcseconds |
| H5 / `vMag` | Johnson V apparent magnitude |
| H37 / `bv` | B−V colour index |

All seven **depth-sample** parallaxes have high signal-to-noise. The broader catalogue includes weak and one negative parallax, handled as described above. These are historical catalogue values. Binary and multiple systems are represented as single catalogue points. Font/point sizes and colours are presentation choices; they are not a simulated eye or telescope image. The faint background is decorative and explicitly labelled as such.

## Time model

For initial RA α and declination δ, the unit direction is

`r = [cosδ cosα, cosδ sinα, sinδ]`.

Local east and north tangent vectors are

`eα = [-sinα, cosα, 0]`

`eδ = [-sinδ cosα, -sinδ sinα, cosδ]`.

One milliarcsecond is `(π/180)/3,600,000` radians. The transverse angular vector is

`v = μRA* eα + μDec eδ` (after conversion to radians/year).

At elapsed time Δt, the displayed direction is `normalise(r + Δt v)`. This is a linear transverse-displacement model with zero unmodelled radial component, projected back onto the unit sphere. We do not divide μRA* by cosδ when using the local tangent vector. The model remains finite at the poles.

Each constellation's camera is a fixed gnomonic projection aimed at the normalised mean of its initial unit directions, with east to the left and north up. Epoch positions determine initial framing. The view does not automatically rescale while time runs: users can zoom out or fit the current and original patterns, and out-of-frame stars are counted. The dashed guide remains at J1991.25. The slider covers ±100,000 years from that catalogue epoch. The initial state is **not labelled today**. All measured stars remain in front of their selected constellation's camera at the two allowed time endpoints; stars may move beyond the chosen rectangular frame, which is separately disclosed.

**Limitations:** radial velocities, Galactic gravitational acceleration, stellar encounters, binary orbits, Earth's axial precession, evolving luminosity, stellar births and deaths are omitted. This is a measured-data illustration of accumulating proper motion, not an accurate long-term ephemeris. Long extrapolations can be materially wrong. The source values' uncertainties are not propagated into position ellipses.

ESA's related explainer demonstrates how an asterism changes and explicitly notes that births and deaths are absent from its illustrative animation:

<https://www.esa.int/articles/about-us/directorates/science/gaia/the-future-of-the-orion-constellation>

## Depth model

Distance is approximated as `d(pc) = 1000 / parallax(mas)`. One parsec is taken as 3.261563777 light-years. A source's Cartesian coordinate is `d × r` in the same ICRS axes.

The observer starts at the origin (Earth/Solar-System position approximated as a point). The slider moves the observer 0–60 light-years along the initial camera's east tangent. This is a sideways journey, **not** a trip to a named star. The camera is reoriented to keep the sample's mean Cartesian location in view. The gnomonic angular scale stays fixed. The dashed comparison is the original Earth-view pattern.

The inset is an orthographic top-view projection onto the original camera's east/forward plane, not an all-dimensions map.

At the exact or nearly exact position of a star, its direction is undefined. The projection returns a finite, non-visible state. Points behind the camera are also hidden. The chosen sideways path does not coincide with a source. The numerical API explicitly guards these cases.

Distance intervals are computed as `1000/(parallax+σ)` to `1000/(parallax−σ)`, then converted to light-years. They are illustrative inversions of catalogue one-sigma limits, not a modern probabilistic distance inference.

**Limitations:** static geometry, no motion during the journey, no light-time correction, no relativistic aberration or Doppler shift, no new dust/extinction calculation, and no stellar evolution. Apparent sizes are not recalculated as physical photometry from each viewpoint. The journey is an interaction metaphor, not a simulated spacecraft trajectory.

## Verification

Run from this directory:

```sh
node --check sky.js
node --test tests/*.test.js
```

**17 tests pass:** the original 10 numerical/provenance tests plus seven catalogue-level tests. They cover every expanded measurement against retained original TSV fields; exact topology matching and the one explicit exclusion; all 88 figure/search definitions; all epoch positions within both 360px and 1000px plot geometries; finite projection and normalised motion at both ±100,000-year endpoints for every star/constellation; agreement with the independent seven-star depth sample; and source content hashes / embedded-data agreement.

The original checks also cover coordinate axes and round trips, proper-motion units including cosδ, domain failures, parallax uncertainty ordering, Earth-view projection, genuine viewpoint-dependent angular change, and finite handling at/behind sources.

Browser visual QA is owned by the parent atlas task. No browser was installed or launched to bypass the local socket restriction.
