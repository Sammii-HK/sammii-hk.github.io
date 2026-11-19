# Worlds exhibits: sources and model boundaries

Prepared 12 November 2026. All runtime rendering is original procedural canvas artwork; there are no downloaded images, external scripts, runtime API calls, or external asset dependencies.

## Integration

Load `worlds.css`, then `worlds.js`. Call:

```js
const cleanup = window.WorldExhibits.mount('surfaces', container);
// Modes: 'past-earth', 'surfaces', 'interiors', 'gravity'.
cleanup();
```

The function appends a section to the supplied DOM element and returns a cleanup function that removes it, disconnects its ResizeObserver and removes registered listeners. Gravity and geological-process animations are cancelled on cleanup. CommonJS imports expose `models`, `sources`, and `mount` without requiring a DOM. This bundle does not create or deploy an app shell.

## Curated world set

All three comparison modes contain the same **12 worlds**, organised into rocky planets, gas/ice giants, and moons/dwarf planets:

| World | Daylight viewpoint | Interior model | Gravity (m/s²) |
|---|---|---|---:|
| Mercury | Black sky, craters and scarps | Thin rocky shell, large metallic core | 3.7 |
| Venus | Diffuse ochre light | Crust, rocky mantle, uncertain core | 8.9 |
| Earth | Mountain and lake landscape | Crust, mantle, liquid outer/solid inner core | 9.8 |
| Mars | Dusty sky with local blue sunset glow | Crust, mantle, simplified metallic core | 3.7 |
| Jupiter | Cloud bands and storm; no ground | Hydrogen fluids, metallic hydrogen, dilute core | 23.1 † |
| Saturn | Haze and cloud bands; no ground | Hydrogen fluids and heavy-element core region | 9.0 † |
| Uranus | Hazy cloud deck; no ground | Envelope, hot volatile-rich interior, rock-rich centre | 8.7 † |
| Neptune | Cloud streaks and vortex; no ground | Envelope, hot volatile-rich interior, rock-rich centre | 11.0 † |
| Moon | Black sky and cratered terrain | Crust, mantle, grouped core region | 1.6 |
| Europa | Black sky, ice ridges and fractures | Ice, inferred ocean, rock and core | 1.31 |
| Titan | Haze, dunes and hydrocarbon lake | One possible ice/ocean/rock model | 1.35 |
| Pluto | Haze, ice mountains and glacier plain | Volatile deposits, water ice and rock | 0.62 |

† Giant-planet gravity refers to an atmospheric reference level of **1 bar**, with no solid landing surface.

## Gravity

- [NASA / NSSDCA Planetary Fact Sheet, metric](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), table revision **18 March 2025**.
- [NASA, Fact Sheet Notes](https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html): equatorial acceleration includes the local rotational reduction; giant values are at 1 bar.
- [NASA, Solar System Small Worlds Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/galileanfact_table.html), revision **18 April 2016**, supplies Europa **1.31**, Titan **1.35**, Pluto **0.62 m/s²**.
- [NASA, Detailed Pluto Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html) corroborates **0.62**. The metric summary lists **0.7**, an inconsistency explicitly disclosed in the interface; it is not treated as rounding of 0.62.
- [NASA Glenn, Ballistic Flight Equations](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ballistic-flight-equations/).

The exact no-drag solution is used until first contact with the reference plane:

```text
x = vx₀ t
y = h₀ + vy₀ t − ½ g t²
flight time = (vy₀ + √(vy₀² + 2 g h₀)) / g
```

The model holds acceleration constant over a short trajectory. It omits aerodynamic drag, wind, bounce, terrain, curvature and Coriolis deflection. It uses NASA's effective-gravity values but does not integrate rotational dynamics separately. This is a **vacuum comparison on every world**, with an imaginary reference plane for giant planets.

Displayed trajectories share **one elapsed time and one metre scale on both axes**. The default compares the selected world with Earth. A rocky-world group and all-12 view are available. The plot fits the selected comparison set; scales never differ between the curves displayed together. The domain is calculated over all compared worlds, so Pluto correctly determines the longest trajectory in the all-world view. A ball stays at its endpoint once its flight ends.

Play/pause, replay, rewind, a physical-time scrubber and ¼×/1×/2× playback are explicit. Default state is paused at 1×. Hover inspection reports the selected path's time, distance, height and vertical velocity. Tapping the chart scrubs the common clock to the selected path's position. Keyboard arrows step by 0.1 s (Shift: 1 s), Home/End reach the comparison limits, Space/Enter play or pause, and Escape clears inspection. Native range inputs remain usable without animation. Tooltips also respond to focus and tap. Playback stops when the page is hidden or reduced-motion preferences change.

## Daylight and interior provenance

The following primary NASA pages were retrieved or checked on **12 November 2026**:

- [Mercury Facts](https://science.nasa.gov/mercury/facts/)
- [Venus Facts](https://science.nasa.gov/venus/venus-facts/)
- [Earth Facts](https://science.nasa.gov/earth/facts/)
- [Mars Facts](https://science.nasa.gov/mars/facts/)
- [Moon Facts](https://science.nasa.gov/moon/facts/)
- [Jupiter Facts](https://science.nasa.gov/jupiter/jupiter-facts/)
- [Saturn Facts](https://science.nasa.gov/saturn/facts/)
- [Uranus Facts](https://science.nasa.gov/uranus/facts/)
- [Neptune Facts](https://science.nasa.gov/neptune/neptune-facts/)
- [Europa Facts](https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/)
- [Titan Facts](https://science.nasa.gov/saturn/moons/titan/facts/)
- [Pluto Facts](https://science.nasa.gov/dwarf-planets/pluto/facts/)
- [NASA, Sunsets on Other Worlds](https://www.nasa.gov/solar-system/nasa-scientist-simulates-sunsets-on-other-worlds/) (22 June 2020)
- [NASA, Sunrises and Sunsets on Mars](https://science.nasa.gov/solar-system/planets/mars/what-does-a-sunrise-sunset-look-like-on-mars/)

### Surfaces / atmospheric viewpoints

This is a stylised atmosphere and lighting study, **not NASA's radiative-transfer simulation**. Hex colours, terrain, Sun arc, glow size, exposure and brightness are artistic choices. No location is implied by the generated terrain. The sun size is not a measured angular size.

The control is a normalised dawn-to-dusk phase, not hours or a calculation of day length, latitude, season, horizon direction or atmospheric density. Mercury's unusual apparent solar motion and Uranus's extreme seasons are therefore not simulated. Mars's blue sunset glow stays local to the Sun; Venus and Titan use diffuse illumination without a sharp visible disc. Airless/near-airless Mercury, Moon and Europa retain black skies rather than borrowing Earth-like sunsets. Europa's ridges and Pluto's glaciers are original schematic terrain.

Jupiter, Saturn, Uranus and Neptune have **cloud-only atmospheric scenes**, expressly labelled as imagined viewpoints. They contain no mountains, soil, solid floor or invented giant-planet ground. Neptune's palette avoids the strongly enhanced blue of some Voyager imagery; this is still an artistic palette, not photometric calibration. Saturn's rings are omitted from its local atmospheric sky because ring appearance depends on geometry; stylised rings are included in the global interior diagram.

### Interiors

Layer names and broad process distinctions follow the linked NASA sources. Interior diagrams are **inferred, simplified models**, shown at equal display sizes. Code radii are drawing proportions, not numerical estimates. Crusts and ice shells are enlarged; small subdivisions are omitted. Cutaway percentage means the fraction of the drawing revealed, not physical depth or excavated volume.

Giant-planet transitions are rendered softly and described as gradual; Jupiter's dilute core is not a neat solid ball. “Ice giant” material is hot and pressurised rather than ordinary frozen surface ice. Europa's ocean has strong observational support. Titan's liquid-rich layer is presented as one possible interior model, not a uniquely established structure. Pluto's possible ocean remains unresolved rather than being drawn as a proven layer. Venus is not assigned established Earth-style global plate tectonics.

## Past Earth

- [USGS, What was Pangea?](https://www.usgs.gov/faqs/what-was-pangea). Text was accessible through the primary-source search result; direct opening encountered the site's JavaScript verification page.
- [USGS, Plate Tectonics and Volcanism in Western California (2025)](https://pubs.usgs.gov/fs/2025/3013/fs20253013.pdf).
- [NASA, Earth Facts](https://science.nasa.gov/earth/facts/).
- [International Commission on Stratigraphy, chart **2024/12**](https://stratigraphy.org/ICSchart/ChronostratChart2024-12.pdf).
- [EarthByte / GPlates model documentation](https://gwsdoc.gplates.org/models/).
- [Official GPlates reconstruction endpoint documentation](https://github.com/GPlates/gplates-web-service/blob/master/doc/content/reconstruction/reconstruct-points.mdx).

**Implemented:** play/pause/replay, rewind and scrub controls for three geological sequences. Divergence widens and deepens a rift into an ocean basin, with new crust at the spreading centre. Convergence lengthens a descending slab and grows a volcanic arc. Transform motion offsets a river and rock bands in the same direction as the motion arrows. Labels change as each sequence develops. Progress is an illustration sequence, with no invented mapping to years or kilometres. The mantle is described as predominantly solid, with local partial melting. Four independent historical markers (approximately 300 Ma, approximately 200 Ma, 66 Ma and today) sit in an expandable context panel. These are not maps or reconstructions; no palaeocoordinates, coastlines or local historical geology are fabricated.

**Exact remaining gap:** the desired place-specific past-Earth reconstruction is not implemented. Retrieving the following documented API and backup endpoints failed through the available web retrieval tool:

```text
https://gws.gplates.org/reconstruct/reconstruct_points/?lons=1.08&lats=51.28&time=100&model=ZAHIROVIC2022&fc
https://gws1.gplates.org/reconstruct/reconstruct_points/?lons=1.08&lats=51.28&time=100&model=ZAHIROVIC2022
```

The service's canonical example also failed retrieval. The inputs are an approximate modern Canterbury reference point, not fetched palaeodata. No API output is bundled.

To replace the fallback properly, obtain and retain point/coastline outputs from a pinned GPlates model, record dataset revision and anchor plate, preserve exact input coordinates and timestamps, validate latitude/longitude order and age domains, and retain raw response checksums. The docs warn that the default model can change, so an implicit default is insufficient. A reconstructed point alone would not justify a generated historical coastline, climate or local landscape.

## Verification

Executed:

```sh
node --check worlds.js
node --test tests/*.test.js
```

**20 tests passed**. Tests cover independent analytic trajectories, ground-contact handling, drop height, SI units, all 12 sourced gravity values/reference levels, speed/gravity scaling, finite UI extremes, the correct all-world comparison domain, a common physical clock before/after landing, invalid domains, daylight endpoints, consistent world coverage, no solid giant surfaces, black airless skies, inferred interior distinctions, geological timeline bounds and monotonic process geometry.

No browser screenshots are claimed by this module. The parent agent owns managed-browser visual/interaction QA.
