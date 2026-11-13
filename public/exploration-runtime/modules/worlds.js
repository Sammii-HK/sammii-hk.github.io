(function (global) {
  'use strict';

  const TAU = Math.PI * 2;
  const PALETTE = { bg: '#10121b', ivory: '#f3eadf', muted: '#c0b6b0', copper: '#e2a47d', lavender: '#c3b0f0', blue: '#8cbee2' };
  const SOURCES = {
    gravity: { title: 'NASA Planetary Fact Sheet, metric (18 March 2025)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    gravityNotes: { title: 'NASA: Fact-sheet definitions (equatorial effective gravity; giant planets at 1 bar)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html' },
    smallGravity: { title: 'NASA: Small Worlds Fact Sheet (Europa, Titan and Pluto)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/galileanfact_table.html' },
    plutoGravity: { title: 'NASA: Detailed Pluto Fact Sheet (gravity cross-check)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html' },
    ballistic: { title: 'NASA Glenn: Ballistic Flight Equations', url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ballistic-flight-equations/' },
    sunsets: { title: 'NASA: Sunsets on Other Worlds', url: 'https://www.nasa.gov/solar-system/nasa-scientist-simulates-sunsets-on-other-worlds/' },
    marsSun: { title: 'NASA: Sunrises and Sunsets on Mars', url: 'https://science.nasa.gov/solar-system/planets/mars/what-does-a-sunrise-sunset-look-like-on-mars/' },
    earth: { title: 'NASA: Earth Facts', url: 'https://science.nasa.gov/earth/facts/' },
    mars: { title: 'NASA: Mars Facts', url: 'https://science.nasa.gov/mars/facts/' },
    venus: { title: 'NASA: Venus Facts', url: 'https://science.nasa.gov/venus/venus-facts/' },
    moon: { title: 'NASA: Moon Facts', url: 'https://science.nasa.gov/moon/facts/' },
    titan: { title: 'NASA: Titan Facts', url: 'https://science.nasa.gov/saturn/moons/titan/facts/' },
    mercury: { title: 'NASA: Mercury Facts', url: 'https://science.nasa.gov/mercury/facts/' },
    jupiter: { title: 'NASA: Jupiter Facts', url: 'https://science.nasa.gov/jupiter/jupiter-facts/' },
    saturn: { title: 'NASA: Saturn Facts', url: 'https://science.nasa.gov/saturn/facts/' },
    uranus: { title: 'NASA: Uranus Facts', url: 'https://science.nasa.gov/uranus/facts/' },
    neptune: { title: 'NASA: Neptune Facts', url: 'https://science.nasa.gov/neptune/neptune-facts/' },
    europa: { title: 'NASA: Europa Facts', url: 'https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/' },
    pluto: { title: 'NASA: Pluto Facts', url: 'https://science.nasa.gov/dwarf-planets/pluto/facts/' },
    analogs: { title: 'NASA: Planetary Analogs', url: 'https://science.nasa.gov/solar-system/planetary-analogs/' },
    pangea: { title: 'USGS: What was Pangea?', url: 'https://www.usgs.gov/faqs/what-was-pangea' },
    boundaries: { title: 'USGS: Plate tectonics and volcanism (2025)', url: 'https://pubs.usgs.gov/fs/2025/3013/fs20253013.pdf' },
    ics: { title: 'International Chronostratigraphic Chart, version 2024/12', url: 'https://stratigraphy.org/ICSchart/ChronostratChart2024-12.pdf' },
    gplates: { title: 'EarthByte / GPlates: reconstruction models', url: 'https://gwsdoc.gplates.org/models/' }
  };
  const WORLD_GROUPS = Object.freeze([
    { name: 'Rocky planets', ids: ['mercury', 'venus', 'earth', 'mars'] },
    { name: 'Gas & ice giants', ids: ['jupiter', 'saturn', 'uranus', 'neptune'] },
    { name: 'Moons & dwarf planets', ids: ['moon', 'europa', 'titan', 'pluto'] }
  ]);
  const GRAVITY = Object.freeze({
    mercury: Object.freeze({ name: 'Mercury', g: 3.7, colour: '#b9b0a6', source: 'gravity', reference: 'surface' }),
    venus: Object.freeze({ name: 'Venus', g: 8.9, colour: '#c3b0f0', source: 'gravity', reference: 'surface' }),
    earth: Object.freeze({ name: 'Earth', g: 9.8, colour: '#8cbee2', source: 'gravity', reference: 'surface' }),
    mars: Object.freeze({ name: 'Mars', g: 3.7, colour: '#e2a47d', source: 'gravity', reference: 'surface' }),
    jupiter: Object.freeze({ name: 'Jupiter', g: 23.1, colour: '#e8bd8b', source: 'gravity', reference: '1 bar atmosphere' }),
    saturn: Object.freeze({ name: 'Saturn', g: 9.0, colour: '#d8c68e', source: 'gravity', reference: '1 bar atmosphere' }),
    uranus: Object.freeze({ name: 'Uranus', g: 8.7, colour: '#9bd0c4', source: 'gravity', reference: '1 bar atmosphere' }),
    neptune: Object.freeze({ name: 'Neptune', g: 11.0, colour: '#8ea9dc', source: 'gravity', reference: '1 bar atmosphere' }),
    moon: Object.freeze({ name: 'Moon', g: 1.6, colour: '#e7dfd8', source: 'gravity', reference: 'surface' }),
    europa: Object.freeze({ name: 'Europa', g: 1.31, colour: '#d4c8a3', source: 'smallGravity', reference: 'surface' }),
    titan: Object.freeze({ name: 'Titan', g: 1.35, colour: '#cb9c63', source: 'smallGravity', reference: 'surface' }),
    pluto: Object.freeze({ name: 'Pluto', g: .62, colour: '#cfa7bb', source: 'smallGravity', reference: 'surface' })
  });
  const SURFACES = Object.freeze({
    earth: { name: 'Earth', kind: 'Planet', dayTop: '#284e75', dayBottom: '#a0c5d4', duskTop: '#42334b', duskBottom: '#dd8b63', ground: '#24272d', haze: '#ffd0a2', disk: true,
      detail: 'A blue daytime sky, with warmer light near the horizon at dawn and dusk. This palette represents a clear-to-hazy atmosphere, not today’s weather.' },
    mars: { name: 'Mars', kind: 'Planet', dayTop: '#8f7064', dayBottom: '#cba287', duskTop: '#604c4c', duskBottom: '#a67a60', ground: '#47312d', haze: '#9fcaef', disk: true,
      detail: 'Fine dust can create a blue glow close to the setting Sun. The rest of the sky stays much warmer; the amount of dust changes the view.' },
    venus: { name: 'Venus', kind: 'Planet', dayTop: '#817045', dayBottom: '#c9aa67', duskTop: '#45402b', duskBottom: '#846c40', ground: '#44382c', haze: '#e0c586', disk: false,
      detail: 'Dense cloud cover turns the surface view into diffuse, ochre light. The hidden Sun is represented by a broad glow, not a visible sharp disc.' },
    titan: { name: 'Titan', kind: 'Saturn’s moon', dayTop: '#795d39', dayBottom: '#bd945b', duskTop: '#352d2a', duskBottom: '#765333', ground: '#302a28', haze: '#c5a173', disk: false, scene: 'dunes',
      detail: 'Organic haze softens the light above dunes and methane–ethane lakes. Titan’s lakes are liquid hydrocarbons; the water here is largely frozen into the ground.' },
    mercury: { name: 'Mercury', kind: 'Rocky planet', scene: 'craters', airless: true, dayTop: '#070910', dayBottom: '#0e111a', duskTop: '#070910', duskBottom: '#0e111a', ground: '#777069', haze: '#e9d3ad', disk: true,
      detail: 'A black sky over grey-brown impact terrain and long cliffs. Mercury has only a tenuous exosphere, so there is no Earth-like blue sky or broad atmospheric sunset.' },
    moon: { name: 'Moon', kind: 'Earth’s moon', scene: 'craters', airless: true, dayTop: '#070910', dayBottom: '#0e111a', duskTop: '#070910', duskBottom: '#0e111a', ground: '#83838a', haze: '#e9e2d6', disk: true,
      detail: 'Hard light reaches a cratered regolith beneath a black sky. The Moon’s exceedingly thin exosphere cannot make an Earth-like daylight sky; dark maria record ancient lava.' },
    europa: { name: 'Europa', kind: 'Jupiter’s moon', scene: 'ice', airless: true, dayTop: '#070a13', dayBottom: '#121721', duskTop: '#070a13', duskBottom: '#121721', ground: '#b7bec2', haze: '#e5edf1', disk: true,
      detail: 'Water-ice plains are crossed by long ridges and reddish fractures. Europa has an extremely thin atmosphere; this scene is an imagined surface view informed by spacecraft observations.' },
    pluto: { name: 'Pluto', kind: 'Dwarf planet', scene: 'glacier', dayTop: '#0b101d', dayBottom: '#43586d', duskTop: '#080c17', duskBottom: '#3b495d', ground: '#9f8e84', haze: '#9bbcd3', disk: true,
      detail: 'Water-ice mountains rise beside plains of volatile ice. A thin atmosphere carries layered haze. The viewpoint is illustrative; sunlight and terrain are not rendered to measured brightness or scale.' },
    jupiter: { name: 'Jupiter', kind: 'Gas giant', scene: 'clouds', viewpoint: 'atmosphere', dayTop: '#675b54', dayBottom: '#c6a887', duskTop: '#39343b', duskBottom: '#9a735c', ground: null, haze: '#e9c5a0', disk: false,
      detail: 'An atmospheric viewpoint above bands of pale clouds and ochre belts. Swirling storms are built into the cloud deck; Jupiter has no solid surface to stand on.' },
    saturn: { name: 'Saturn', kind: 'Gas giant', scene: 'clouds', viewpoint: 'atmosphere', dayTop: '#77766a', dayBottom: '#c9bd91', duskTop: '#393b41', duskBottom: '#8d7e68', ground: null, haze: '#e7d5ae', disk: false,
      detail: 'Pale cloud bands and broad haze fill this imagined upper-atmosphere view. Saturn has no solid surface. Ring geometry depends on location and season and is not fabricated into this local sky.' },
    uranus: { name: 'Uranus', kind: 'Ice giant', scene: 'clouds', viewpoint: 'atmosphere', dayTop: '#406368', dayBottom: '#9bbfbb', duskTop: '#253c43', duskBottom: '#597c7c', ground: null, haze: '#c2e0d6', disk: false,
      detail: 'A hazy blue-green cloudscape in a hydrogen–helium atmosphere containing methane. “Ice giant” describes composition: it does not mean an exposed frozen surface.' },
    neptune: { name: 'Neptune', kind: 'Ice giant', scene: 'clouds', viewpoint: 'atmosphere', dayTop: '#3b5c69', dayBottom: '#9cbcc5', duskTop: '#243b48', duskBottom: '#536d7d', ground: null, haze: '#c2d9e5', disk: false,
      detail: 'Bright cloud streaks cross a blue-green atmosphere with powerful winds. Neptune has no solid surface; this palette avoids the exaggerated deep blue of some processed Voyager images.' }
  });
  // Ratios below are deliberate drawing proportions, not estimated boundary radii.
  const INTERIORS = {
    earth: { name: 'Earth', colour: '#42667a', source: 'earth', processes: 'Plate tectonics · volcanism · water and wind',
      detail: 'Moving lithospheric plates, volcanism and erosion reshape Earth. The mantle is shown as a separate rocky layer; the liquid outer core is not the mantle.',
      layers: [
        { name: 'Crust', r: 1, colour: '#72939a', detail: 'The thin outer rock layer. It is exaggerated here so you can see it.' },
        { name: 'Rocky mantle', r: .955, colour: '#bd7154', detail: 'Rock beneath the crust transports heat over geological time. This diagram does not turn the whole mantle into a liquid ocean.' },
        { name: 'Liquid outer core', r: .55, colour: '#e5a85b', detail: 'An iron-rich liquid region surrounding the solid inner core.' },
        { name: 'Solid inner core', r: .19, colour: '#f1d09a', detail: 'A dense, solid iron-and-nickel region at Earth’s centre.' }
      ] },
    mars: { name: 'Mars', colour: '#986651', source: 'mars', processes: 'Ancient volcanism · impacts · wind · ancient water',
      detail: 'Lava, impacts and past water left large landmarks. Winds move dust and sand today. This is not an Earth-style global plate-tectonics model.',
      layers: [
        { name: 'Crust', r: 1, colour: '#b48368', detail: 'A rocky outer layer carrying the record of impacts, lava and erosion.' },
        { name: 'Rocky mantle', r: .95, colour: '#b96d50', detail: 'The mantle lies beneath the crust. The diagram deliberately leaves fine seismic structure unresolved.' },
        { name: 'Metallic core', r: .52, colour: '#ddb07c', detail: 'An iron-rich central region. Mars’ interior is inferred from measurements, including seismic observations; this is a simplified model.' }
      ] },
    venus: { name: 'Venus', colour: '#a18b60', source: 'venus', processes: 'Volcanism · crustal deformation',
      detail: 'Volcanism and deformation shape Venus. An Earth-style global network of moving plates is not established, so none is added here.',
      layers: [
        { name: 'Crust', r: 1, colour: '#bb9e6c', detail: 'Rocky surface shaped by volcanoes and deformation, beneath a dense atmosphere.' },
        { name: 'Rocky mantle', r: .95, colour: '#af7755', detail: 'A hot, rocky mantle is expected beneath the crust. Its boundaries here are illustrative.' },
        { name: 'Iron-rich core', r: .52, colour: '#e1ad73', detail: 'Venus is expected to have an iron-rich core. Its exact size and physical state are not established by this diagram.' }
      ] },
    moon: { name: 'Moon', colour: '#86848b', source: 'moon', processes: 'Impacts · ancient lava plains',
      detail: 'Impact craters retain a long record; the dark maria are ancient lava plains. The Moon is not shown with an Earth-style plate network.',
      layers: [
        { name: 'Crust', r: 1, colour: '#b3aeb7', detail: 'The outer rock layer is thicker on the far side on average. Thickness is exaggerated and uniform in this schematic.' },
        { name: 'Rocky mantle', r: .94, colour: '#8f6d62', detail: 'Rock below the crust. Fine internal layers are omitted in this small comparison.' },
        { name: 'Small core region', r: .2, colour: '#e0ad7d', detail: 'The Moon has a proportionally small core. Solid, liquid and partly molten sublayers are grouped here for clarity.' }
      ] }
  };
  Object.assign(INTERIORS, {
    mercury: { name: 'Mercury', colour: '#82766c', source: 'mercury', processes: 'Impacts · cooling and contraction · ancient volcanism',
      detail: 'An unusually large metal-rich core leaves a comparatively thin rocky shell. Long surface scarps record contraction as the interior cooled.',
      layers: [
        { name: 'Crust', r: 1, colour: '#ad9d8f', detail: 'Rocky impact terrain and volcanic plains; the visible thickness is enlarged.' },
        { name: 'Rocky mantle', r: .94, colour: '#af7d61', detail: 'A relatively thin rocky mantle surrounds the large core.' },
        { name: 'Large metallic core', r: .78, colour: '#dfb37b', detail: 'A very large iron-rich core with evidence for a liquid or partly molten region. Internal sublayers are grouped.' }
      ] },
    jupiter: { name: 'Jupiter', colour: '#af8c72', source: 'jupiter', diffuse: true, processes: 'Atmospheric jets · convection · deep fluid motion',
      detail: 'There is no crust or land. Pressure changes hydrogen into dense fluid and metallic states. Juno supports a dilute core that blends into its surroundings.',
      layers: [
        { name: 'Atmosphere', r: 1, colour: '#d5b89b', detail: 'Hydrogen and helium with cloud-forming compounds. This outer edge is a reference level, not a solid boundary.' },
        { name: 'Dense hydrogen fluid', r: .88, colour: '#b78970', detail: 'Hydrogen becomes a dense fluid as pressure increases; no sharp global liquid surface is implied.' },
        { name: 'Metallic hydrogen', r: .65, colour: '#a8a7bd', detail: 'Under extreme pressure, hydrogen conducts electricity. Layer transitions are broadened and schematic.' },
        { name: 'Dilute core region', r: .39, colour: '#d7aa75', detail: 'Heavy material mixes with the surrounding fluid. This is not a neatly bounded solid ball.' }
      ] },
    saturn: { name: 'Saturn', colour: '#b8a477', source: 'saturn', diffuse: true, processes: 'Atmospheric bands · convection · deep fluid motion',
      detail: 'A hydrogen–helium envelope surrounds deeper dense and metallic hydrogen and a region enriched in heavier material. The diagram cannot determine the shape of that core.',
      layers: [
        { name: 'Atmosphere', r: 1, colour: '#d9ca9d', detail: 'Clouds sit within a gaseous envelope. Saturn has no solid ground at this outer edge.' },
        { name: 'Dense hydrogen fluid', r: .87, colour: '#bf9b75', detail: 'Hydrogen is compressed into a dense fluid deeper inside.' },
        { name: 'Metallic hydrogen', r: .58, colour: '#a3a3b3', detail: 'High pressure produces electrically conducting hydrogen. Its extent is not measured by these drawing ratios.' },
        { name: 'Heavy-element core region', r: .32, colour: '#d7aa75', detail: 'A central region enriched in rock, metal and other heavy material. A crisp physical boundary is not assumed.' }
      ] },
    uranus: { name: 'Uranus', colour: '#7baba7', source: 'uranus', diffuse: true, processes: 'Extreme seasons · atmospheric winds · deep heat transport',
      detail: 'A simplified ice-giant model: a light outer envelope over a hot dense interior rich in water, ammonia and methane. “Ices” does not mean ordinary frozen ice at these depths.',
      layers: [
        { name: 'Hydrogen–helium envelope', r: 1, colour: '#9dc8c0', detail: 'An atmosphere containing methane grades into the deeper envelope. There is no solid surface.' },
        { name: 'Hot volatile-rich interior', r: .78, colour: '#578a99', detail: 'High-pressure water, ammonia and methane-rich material in uncertain states and mixtures; not a cold liquid-water sea.' },
        { name: 'Rock-rich central region', r: .28, colour: '#b8957f', detail: 'Rock-rich material is expected at depth. Composition, mixing and layer boundaries remain uncertain.' }
      ] },
    neptune: { name: 'Neptune', colour: '#7299af', source: 'neptune', diffuse: true, processes: 'Fast atmospheric winds · storms · interior heat',
      detail: 'Neptune is denser than Uranus. This broad model places a volatile-rich interior below a deep atmosphere; detailed internal boundaries are inferred, not directly photographed.',
      layers: [
        { name: 'Hydrogen–helium envelope', r: 1, colour: '#8eb7c5', detail: 'Methane-bearing air continues to great depth and blends into hotter dense material.' },
        { name: 'Hot volatile-rich interior', r: .82, colour: '#51788e', detail: 'Water and other volatile materials under immense pressure. Their behaviour differs from familiar surface liquids and ice.' },
        { name: 'Rock-rich central region', r: .3, colour: '#b99b85', detail: 'A heavier central region is part of this simplified model; the drawn radius is not an estimate.' }
      ] },
    europa: { name: 'Europa', colour: '#b9b5a6', source: 'europa', processes: 'Tidal flexing · ice ridges · exchange with the interior',
      detail: 'Gravity and magnetic measurements support an ocean beneath Europa’s icy shell. Its ice thickness and deeper structure are active research questions.',
      layers: [
        { name: 'Ice shell', r: 1, colour: '#d9d9cb', detail: 'Water ice forms the fractured outer shell. Enlarged here so you can inspect it.' },
        { name: 'Inferred ocean', r: .87, colour: '#548698', detail: 'Strong evidence supports a salty global ocean. Its depth is not encoded in this diagram.' },
        { name: 'Rocky interior', r: .69, colour: '#ac8167', detail: 'Silicate rock beneath the water layers; tidal energy can heat the interior.' },
        { name: 'Metal-rich core', r: .27, colour: '#d1ab7b', detail: 'An iron-rich core is included in standard interior models; its exact extent is uncertain.' }
      ] },
    titan: { name: 'Titan', colour: '#a18051', source: 'titan', processes: 'Methane weather · dunes · water-ice geology',
      detail: 'A possible layered model, not a uniquely established interior. The methane–ethane lakes on the surface are separate from the water-rich layers deeper down.',
      layers: [
        { name: 'Water-ice crust', r: 1, colour: '#c9b18b', detail: 'Cold water ice makes much of the solid surface beneath organic deposits and hydrocarbon lakes.' },
        { name: 'Possible water-rich ocean', r: .86, colour: '#597e8c', detail: 'One interpretation of Cassini data places a liquid water-rich layer here. Its state and extent remain model-dependent.' },
        { name: 'High-pressure ice region', r: .69, colour: '#93a8ae', detail: 'Some models include dense high-pressure ice between the liquid-rich layer and the rocky interior.' },
        { name: 'Rocky interior', r: .49, colour: '#b18e73', detail: 'Rock-rich material dominates the deeper interior in this simplified model.' }
      ] },
    pluto: { name: 'Pluto', colour: '#a78f84', source: 'pluto', processes: 'Volatile-ice glaciers · seasonal atmosphere · impacts',
      detail: 'A rock-rich interior lies beneath water ice and surface deposits of more volatile ices. A surviving subsurface ocean is a possibility, not an established layer in this view.',
      layers: [
        { name: 'Volatile-ice deposits', r: 1, colour: '#d2c4bc', detail: 'Nitrogen, methane and carbon-monoxide ices occur at the surface. This enlarged, continuous ring stands in for patchy deposits.' },
        { name: 'Water-ice shell', r: .91, colour: '#9eafbd', detail: 'Cold water ice supplies a strong outer shell and mountain-building material. Possible liquid at depth is unresolved here.' },
        { name: 'Rock-rich core', r: .62, colour: '#b38b70', detail: 'A rocky central region is expected. Neither its size nor a possible ocean is measured by the drawing proportions.' }
      ] }
  });
  const GEOLOGICAL_PERIODS = Object.freeze([
    { name: 'Quaternary', younger: 0, older: 2.58 },
    { name: 'Neogene', younger: 2.58, older: 23.04 },
    { name: 'Paleogene', younger: 23.04, older: 66 },
    { name: 'Cretaceous', younger: 66, older: 143.1 },
    { name: 'Jurassic', younger: 143.1, older: 201.4 },
    { name: 'Triassic', younger: 201.4, older: 251.902 },
    { name: 'Permian', younger: 251.902, older: 298.9 },
    { name: 'Carboniferous', younger: 298.9, older: 358.86 }
  ]);
  const HISTORY = [
    { age: 300, name: 'Pangea', title: 'Continents together', text: 'During roughly 300–200 million years ago, land that now includes North America, Africa, South America and Europe formed part of Pangea. This is a historical marker, not a map of the continents.' },
    { age: 200, name: 'A new ocean', title: 'Rifting and the Atlantic', text: 'Rifting helped split Pangea, with new oceanic crust opening the Atlantic basin. The moving cross-section above illustrates the process, not a reconstruction of a particular place or date.' },
    { age: 66, name: 'A boundary', title: 'Cretaceous meets Paleogene', text: 'The International Chronostratigraphic Chart places this period boundary at 66.0 million years ago. Geological time labels organise the record; they do not specify where a plate was.' },
    { age: 0, name: 'Today', title: 'The surface is still changing', text: 'Earth’s lithosphere is divided into moving plates. Separating, converging and sliding boundaries leave different kinds of geological evidence.' }
  ];
  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(name + ' must be a finite number');
    return value;
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function normalisePhase(value) { return clamp(finite(value, 'phase'), 0, 1); }
  function worldGravity(id) {
    if (!Object.prototype.hasOwnProperty.call(GRAVITY, id)) throw new RangeError('Unknown gravity world');
    return GRAVITY[id].g;
  }
  function projectileOptions(options) {
    options = options || {};
    const speed = finite(options.speed === undefined ? 12 : options.speed, 'speed');
    const angle = finite(options.angleDeg === undefined ? 45 : options.angleDeg, 'angleDeg');
    const g = finite(options.gravity === undefined ? 9.8 : options.gravity, 'gravity');
    const height = finite(options.height === undefined ? 0 : options.height, 'height');
    if (speed < 0 || speed > 10000 || angle < 0 || angle > 90 || g < .001 || g > 100000 || height < 0 || height > 1000000) throw new RangeError('Projectile parameters outside the supported domain');
    const radians = angle * Math.PI / 180;
    return { speed: speed, angle: angle, gravity: g, height: height, vx: speed * Math.cos(radians), vy: speed * Math.sin(radians) };
  }
  function projectileStats(options) {
    const p = projectileOptions(options);
    const time = (p.vy + Math.sqrt(p.vy * p.vy + 2 * p.gravity * p.height)) / p.gravity;
    return { flightTime: time, range: p.vx * time, maxHeight: p.height + p.vy * p.vy / (2 * p.gravity), apexTime: p.vy / p.gravity };
  }
  function projectileAt(time, options) {
    finite(time, 'time'); if (time < 0) throw new RangeError('time must not be negative');
    const p = projectileOptions(options);
    const end = projectileStats(options).flightTime;
    const t = Math.min(time, end);
    const landed = time >= end;
    return { x: p.vx * t, y: Math.max(0, p.height + p.vy * t - .5 * p.gravity * t * t), vx: landed ? 0 : p.vx, vy: landed ? 0 : p.vy - p.gravity * t, time: t, landed: landed };
  }
  function comparisonDomain(ids, speed, angleDeg) {
    if (!Array.isArray(ids) || !ids.length) throw new RangeError('Choose at least one comparison world');
    const values = ids.map(id => projectileStats({ speed: speed, angleDeg: angleDeg, gravity: worldGravity(id) }));
    return { range: Math.max(...values.map(s => s.range)), maxHeight: Math.max(...values.map(s => s.maxHeight)), flightTime: Math.max(...values.map(s => s.flightTime)) };
  }
  function daylightAt(phase) {
    const p = normalisePhase(phase);
    const altitude = Math.max(0, Math.sin(Math.PI * p));
    const twilight = Math.pow(1 - altitude, 1.6);
    return { phase: p, altitude: altitude, twilight: twilight, label: p < .08 ? 'Dawn' : p < .4 ? 'Morning' : p <= .6 ? 'Noon' : p < .92 ? 'Afternoon' : 'Dusk' };
  }
  function periodAt(age) {
    finite(age, 'age'); if (age < 0 || age > 300) throw new RangeError('This timeline covers 0–300 Ma');
    return GEOLOGICAL_PERIODS.find(p => age >= p.younger && age < p.older).name;
  }
  function tectonicFrame(kind, progress) {
    const p = normalisePhase(progress);
    if (kind === 'divergent') return { kind: kind, p: p, gap: .02 + p * .5, depth: .035 + p * .13, relief: .06 * (1 - p), view: 'Cross-section', label: 'Plates pull apart' };
    if (kind === 'convergent') return { kind: kind, p: p, gap: 0, slabDepth: .12 + p * .39, relief: .015 + p * .18, view: 'Cross-section', label: 'One plate descends' };
    if (kind === 'transform') return { kind: kind, p: p, offset: p * .35, relief: 0, view: 'Plan view', label: 'Plates slide past' };
    throw new RangeError('Unknown boundary kind');
  }
  function mixHex(a, b, t) {
    const p = clamp(t, 0, 1);
    const n = [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - p) + parseInt(b.slice(i, i + 2), 16) * p));
    return 'rgb(' + n.join(',') + ')';
  }
  function seeded(seed) { let n = seed >>> 0; return function () { n = (1664525 * n + 1013904223) >>> 0; return n / 4294967296; }; }

  let nextId = 0;
  function base(container, options) {
    const el = typeof container === 'string' ? global.document.querySelector(container) : container;
    if (!el || typeof el.appendChild !== 'function') throw new TypeError('A mount container is required');
    const root = global.document.createElement('section');
    root.className = 'we-root';
    root.innerHTML = '<p class="we-kicker">' + options.kicker + '</p><h2>' + options.title + '</h2>' +
      '<p class="we-intro">' + options.intro + '</p><div class="we-worlds"></div><div class="we-stage">' +
      '<canvas role="img" aria-label="' + options.aria + '"></canvas></div><p class="we-stage-note">' + options.note + '</p>' +
      '<div class="we-controls"></div><div class="we-content"></div><details><summary>Model &amp; sources</summary><p>' +
      options.limit + '</p><ul>' + options.sources.map(id => '<li><a href="' + SOURCES[id].url + '" target="_blank" rel="noopener noreferrer">' + SOURCES[id].title + '</a></li>').join('') + '</ul></details>';
    el.appendChild(root);
    const listeners = [];
    let disposed = false;
    const api = {
      root: root, canvas: root.querySelector('canvas'), controls: root.querySelector('.we-controls'),
      worlds: root.querySelector('.we-worlds'), content: root.querySelector('.we-content'),
      on: function (target, type, fn) { target.addEventListener(type, fn); listeners.push([target, type, fn]); },
      cleanup: function () { if (disposed) return; disposed = true; listeners.forEach(x => x[0].removeEventListener(x[1], x[2])); root.remove(); },
      isDisposed: function () { return disposed; }
    };
    return api;
  }
  function worldButtons(api, items, initial, callback) {
    const buttons = [];
    items.forEach(item => {
      const b = global.document.createElement('button'); b.type = 'button'; b.textContent = item.label;
      b.setAttribute('aria-pressed', String(item.id === initial)); api.worlds.appendChild(b);
      api.on(b, 'click', function () { buttons.forEach(x => x.button.setAttribute('aria-pressed', String(x.id === item.id))); callback(item.id); });
      buttons.push({ id: item.id, button: b });
    });
    return buttons;
  }
  function worldSelect(api, data, initial, callback) {
    const wrapper = global.document.createElement('div'); wrapper.className = 'we-world-select';
    const id = 'we-world-' + (++nextId);
    wrapper.innerHTML = '<label for="' + id + '">Explore a world</label><select id="' + id + '"></select><span class="we-world-count">12 worlds</span>';
    const select = wrapper.querySelector('select');
    WORLD_GROUPS.forEach(group => {
      const optgroup = global.document.createElement('optgroup'); optgroup.label = group.name;
      group.ids.forEach(key => { if (!data[key]) return; const option = global.document.createElement('option'); option.value = key; option.textContent = data[key].name; optgroup.appendChild(option); });
      select.appendChild(optgroup);
    });
    select.value = initial;
    api.on(select, 'change', function () { callback(select.value); }); api.worlds.appendChild(wrapper);
    return select;
  }
  function help(api, parent, label, detail) {
    const wrapper = global.document.createElement('span'); wrapper.className = 'we-help';
    const id = 'we-help-' + (++nextId);
    const button = global.document.createElement('button'); button.type = 'button'; button.className = 'we-info'; button.textContent = 'i'; button.setAttribute('aria-label', 'About ' + label); button.setAttribute('aria-describedby', id);
    const panel = global.document.createElement('span'); panel.className = 'we-tooltip'; panel.id = id; panel.setAttribute('role', 'tooltip'); panel.textContent = detail;
    wrapper.appendChild(button); wrapper.appendChild(panel); parent.appendChild(wrapper);
    api.on(button, 'click', function () { const open = wrapper.dataset.open !== 'true'; api.root.querySelectorAll('.we-help').forEach(el => { el.dataset.open = 'false'; }); wrapper.dataset.open = String(open); });
    api.on(button, 'keydown', function (event) { if (event.key === 'Escape') { wrapper.dataset.open = 'false'; button.blur(); } });
    api.on(global.document, 'pointerdown', function (event) { if (!wrapper.contains(event.target)) wrapper.dataset.open = 'false'; });
    return panel;
  }
  function range(api, name, min, max, step, value, formatter, callback, parent) {
    const id = 'we-input-' + (++nextId); const wrapper = global.document.createElement('div'); wrapper.className = 'we-range';
    wrapper.innerHTML = '<div class="we-range-row"><label for="' + id + '">' + name + '</label><output for="' + id + '"></output></div><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">';
    (parent || api.controls).appendChild(wrapper);
    const input = wrapper.querySelector('input'), output = wrapper.querySelector('output');
    function set(v) { input.value = String(v); output.textContent = formatter(Number(v)); input.setAttribute('aria-valuetext', formatter(Number(v))); }
    set(value);
    api.on(input, 'input', function () { const v = Number(input.value); set(v); callback(v); });
    return { input: input, output: output, set: set };
  }
  function stage(api, draw, ratio) {
    const ctx = api.canvas.getContext('2d'); if (!ctx) throw new Error('Canvas 2D is unavailable');
    let width = 0, height = 0;
    function render() { if (api.isDisposed() || !width) return; ctx.clearRect(0, 0, width, height); ctx.save(); draw(ctx, width, height); ctx.restore(); }
    function resize() {
      if (api.isDisposed()) return;
      width = Math.max(240, Math.round(api.canvas.parentElement.getBoundingClientRect().width || 720));
      height = Math.round(clamp(width * (ratio || .52), 270, 430));
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      api.canvas.width = width * dpr; api.canvas.height = height * dpr; api.canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); render();
    }
    let observer;
    if (typeof global.ResizeObserver === 'function') { observer = new global.ResizeObserver(resize); observer.observe(api.canvas.parentElement); }
    else api.on(global, 'resize', resize);
    resize();
    return { render: render, cleanup: function () { if (observer) observer.disconnect(); }, dimensions: function () { return { width: width, height: height }; } };
  }
  function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, Math.max(.01, r), 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
  function text(ctx, value, x, y, size, colour, align) { ctx.font = (size || 13) + 'px system-ui, sans-serif'; ctx.textAlign = align || 'left'; ctx.fillStyle = colour || PALETTE.ivory; ctx.fillText(value, x, y); }
  function stars(ctx, w, h, opacity) {
    const rand = seeded(1974); ctx.save(); ctx.fillStyle = PALETTE.ivory;
    for (let i = 0; i < 70; i++) { ctx.globalAlpha = (opacity || .4) * (.2 + rand() * .8); circle(ctx, rand() * w, rand() * h, .35 + rand() * .65, PALETTE.ivory); }
    ctx.restore();
  }
  function arrow(ctx, x1, y1, x2, y2, colour) {
    const a = Math.atan2(y2 - y1, x2 - x1); ctx.save(); ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(a - .45) * 8, y2 - Math.sin(a - .45) * 8); ctx.lineTo(x2 - Math.cos(a + .45) * 8, y2 - Math.sin(a + .45) * 8); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function polygon(ctx, points, fill) { ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }

  function mountSurfaces(container) {
    let selected = 'mars', phase = .96;
    const api = base(container, {
      kicker: 'Worlds / Atmospheres', title: 'Borrow another sky',
      intro: 'Move through daylight across twelve worlds: rocky horizons, icy plains and cloud decks.',
      aria: 'An illustrative daylight scene. Choose a world and scrub between dawn and dusk.',
      note: 'Illustrative colours, landforms and Sun size. The daylight slider is a lighting phase, not a local clock.',
      limit: 'Painted atmosphere studies informed by NASA observations, not radiative-transfer or weather simulations. Dawn–dusk is a normalised lighting phase, not a calculation of latitude, seasons, day length or exact solar motion. Giant planets use imagined atmospheric viewpoints without solid ground. Airless worlds retain black skies. Solar size, exposure and terrain are illustrative. Venus and Titan show diffuse light; the blue Martian sunset halo stays near the Sun.',
      sources: ['sunsets', 'marsSun', 'mercury', 'moon', 'venus', 'titan', 'europa', 'pluto', 'jupiter', 'saturn', 'uranus', 'neptune']
    });
    api.content.innerHTML = '<div class="we-detail"><strong class="we-surface-name"></strong><span class="we-surface-moment"></span></div><p class="we-body we-surface-detail" aria-live="polite"></p><p class="we-scene-caption"></p>';
    function draw(ctx, w, h) {
      const data = SURFACES[selected], day = daylightAt(phase), clouds = data.viewpoint === 'atmosphere';
      const horizon = h * (clouds ? .64 : .69);
      const top = mixHex(data.dayTop, data.duskTop, day.twilight), bottom = mixHex(data.dayBottom, data.duskBottom, day.twilight);
      const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, top); sky.addColorStop(.72, bottom); sky.addColorStop(1, top); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      const sx = w * (.15 + phase * .7), sy = horizon - day.altitude * h * .48;
      if (!data.airless) {
        const glowR = selected === 'mars' ? h * (.15 + day.twilight * .18) : h * .45;
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        glow.addColorStop(0, data.haze + 'c0'); glow.addColorStop(.17, data.haze + '70'); glow.addColorStop(1, data.haze + '00');
        ctx.globalAlpha = selected === 'mars' ? .12 + .8 * day.twilight : .32 + .25 * day.twilight;
        circle(ctx, sx, sy, glowR, glow); ctx.globalAlpha = 1;
      }
      if (data.disk) circle(ctx, sx, sy, Math.max(3.2, w * .008), '#fff1dc');
      if (clouds) {
        // Every foreground layer is cloud, with no horizon line pretending to be land.
        const amplitudes = selected === 'saturn' ? [.012, .02, .028, .035, .05] : selected === 'uranus' ? [.014, .025, .03, .034, .04] : [.025, .045, .055, .07, .08];
        for (let layer = 0; layer < 5; layer++) {
          const y = h * (.46 + layer * .12), points = [[0, h]];
          for (let x = 0; x <= w + 6; x += 6) {
            const wave = Math.sin(x / w * (8 + layer) + layer * 1.7) + .25 * Math.cos(x / w * 25 + layer);
            points.push([x, y + wave * h * amplitudes[layer]]);
          }
          points.push([w, h]);
          const colour = mixHex(data.dayBottom, layer % 2 ? data.dayTop : data.haze, .25 + layer * .08);
          ctx.globalAlpha = .75; polygon(ctx, points, colour); ctx.globalAlpha = 1;
        }
        if (selected === 'jupiter' || selected === 'neptune') {
          const cx = w * .69, cy = h * .69, rx = w * .105, ry = h * .035;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.09);
          for (let ring = 5; ring > 0; ring--) { ctx.beginPath(); ctx.ellipse(0, 0, rx * ring / 5, ry * ring / 5, 0, 0, TAU); ctx.fillStyle = selected === 'jupiter' ? mixHex('#bc7e5c', '#d0b69a', ring / 7) : mixHex('#315868', '#87b3c0', ring / 7); ctx.fill(); }
          ctx.restore();
        }
        ctx.strokeStyle = data.haze + '80'; ctx.lineWidth = 1;
        for (let i = 0; i < (selected === 'uranus' ? 4 : 12); i++) { const y = h * (.54 + i * .03); ctx.beginPath(); ctx.ellipse(w * (.15 + (i % 4) * .24), y, w * .17, h * .009, -.03, Math.PI, TAU); ctx.stroke(); }
        text(ctx, 'ATMOSPHERIC VIEWPOINT · NO SOLID SURFACE', 20, h - 22, w < 420 ? 9 : 11, PALETTE.ivory);
      } else {
        const ground = mixHex(data.ground, '#10121b', .24 + day.twilight * .18);
        for (let layer = 0; layer < 3; layer++) {
          const y = horizon + h * (layer * .09 - .02), points = [[0, h]];
          for (let x = 0; x <= w + 5; x += 5) {
            const dune = Math.sin(x / w * Math.PI * (2.4 + layer) + layer) * .55 + Math.sin(x / w * 13 + 2 * layer) * .17;
            const jagged = Math.sin(x / w * 19 + layer) * .25 + Math.sin(x / w * 37) * .1;
            const icy = data.scene === 'ice' ? .2 : data.scene === 'glacier' ? 1.3 : 1;
            const shape = selected === 'titan' ? dune : dune + jagged * icy;
            points.push([x, y + shape * h * (layer === 1 ? .07 : .045) * icy]);
          }
          points.push([w, h]); polygon(ctx, points, mixHex(ground, bottom, layer ? .02 : .22));
        }
        if (data.scene === 'craters') {
          const rand = seeded(selected === 'moon' ? 11 : 73);
          for (let i = 0; i < 16; i++) {
            const x = rand() * w, y = h * (.76 + rand() * .22), r = (7 + rand() * 18) * (w / 700 + .5);
            ctx.beginPath(); ctx.ellipse(x, y, r, r * .24, -.04, 0, TAU); ctx.fillStyle = '#10121b55'; ctx.fill();
            ctx.beginPath(); ctx.ellipse(x, y, r, r * .24, -.04, phase < .5 ? Math.PI : 0, phase < .5 ? TAU : Math.PI); ctx.strokeStyle = '#d5d0c180'; ctx.lineWidth = 1.3; ctx.stroke();
          }
          if (selected === 'mercury') { polygon(ctx, [[w * .08, h], [w * .33, h * .78], [w * .49, h * .82], [w * .34, h]], '#312d2a88'); }
        }
        if (data.scene === 'ice') {
          ctx.lineWidth = 2; ctx.strokeStyle = '#786b62';
          for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(w * (i / 6 - .1), h); ctx.bezierCurveTo(w * (.35 + i / 12), h * .89, w * (i / 5), h * .84, w * (.2 + i / 7), horizon + 15); ctx.stroke(); }
          ctx.lineWidth = .8; ctx.strokeStyle = '#ebeee4aa'; ctx.beginPath(); ctx.moveTo(0, h * .87); ctx.lineTo(w * .3, h * .89); ctx.lineTo(w * .47, h * .82); ctx.lineTo(w, h * .86); ctx.stroke();
        }
        if (data.scene === 'glacier') {
          polygon(ctx, [[w * .31, horizon + 15], [w * .61, horizon + 10], [w, h], [w * .1, h]], '#c2b4a6');
          ctx.strokeStyle = '#8e888580'; ctx.lineWidth = 1;
          for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(w * (.25 + (i % 5) * .14), h * (.84 + Math.floor(i / 5) * .14), w * .07, h * .04, 0, 0, TAU); ctx.stroke(); }
        }
        if (selected === 'titan') { ctx.fillStyle = '#171b207f'; ctx.beginPath(); ctx.ellipse(w * .29, h * .84, w * .2, h * .022, -.08, 0, TAU); ctx.fill(); }
        if (selected === 'earth') { const lake = ctx.createLinearGradient(0, horizon, 0, h); lake.addColorStop(0, '#64848b90'); lake.addColorStop(1, '#182531'); polygon(ctx, [[w * .48, horizon + 23], [w * .62, horizon + 29], [w, h], [w * .26, h]], lake); }
      }
      text(ctx, data.name.toUpperCase(), 20, 29, 12, '#f7edde');
      text(ctx, day.label.toUpperCase(), w - 20, 29, 11, '#f7edde', 'right');
    }
    const view = stage(api, draw, .54);
    function update() {
      const data = SURFACES[selected], day = daylightAt(phase);
      api.root.querySelector('.we-surface-name').textContent = data.name + ' · ' + data.kind;
      api.root.querySelector('.we-surface-moment').textContent = day.label;
      api.root.querySelector('.we-surface-detail').textContent = data.detail;
      api.root.querySelector('.we-scene-caption').innerHTML = '<a href="' + SOURCES[selected].url + '" target="_blank" rel="noopener noreferrer">Read the observations behind this world ↗</a>';
      api.canvas.setAttribute('aria-label', data.name + ', ' + day.label.toLowerCase() + '. ' + (data.viewpoint === 'atmosphere' ? 'An imagined atmospheric viewpoint without a solid surface. ' : '') + data.detail);
      view.render();
    }
    worldSelect(api, SURFACES, selected, function (id) { selected = id; update(); });
    const slider = range(api, 'Move through daylight', 0, 1, .005, phase, function (v) { return daylightAt(v).label; }, function (v) { phase = v; update(); });
    const moments = global.document.createElement('div'); moments.className = 'we-moments'; api.controls.appendChild(moments);
    [['Dawn', 0], ['Noon', .5], ['Dusk', 1]].forEach(item => { const button = global.document.createElement('button'); button.type = 'button'; button.textContent = item[0]; moments.appendChild(button); api.on(button, 'click', function () { phase = item[1]; slider.set(phase); update(); }); });
    update();
    return function () { view.cleanup(); api.cleanup(); };
  }

  function mountInteriors(container) {
    let selected = 'earth', cut = .74, layerIndex = 1;
    const api = base(container, {
      kicker: 'Worlds / Under the surface', title: 'Peel back a planet',
      intro: 'Reveal the layers, then compare the forces that leave marks on the surface.',
      aria: 'A schematic cutaway of one of twelve worlds. Select a world, change the cutaway, or choose a layer.',
      note: 'Inferred interior models · equal display sizes · schematic layer thicknesses · crusts enlarged',
      limit: 'Simplified comparative models, not measured cross-section images. Drawing radii are chosen for readability and worlds are shown at equal display size. Gas and ice giants have no solid surface; their internal transitions are gradual and uncertain. Jupiter’s dilute core is not a solid ball. Titan’s ocean is a possible model; an ocean is not established for Pluto. Earth’s solid inner and liquid outer core are separated. Fine sublayers are omitted.',
      sources: ['earth', 'mercury', 'mars', 'venus', 'moon', 'jupiter', 'saturn', 'uranus', 'neptune', 'europa', 'titan', 'pluto']
    });
    api.content.innerHTML = '<div class="we-layer-list" role="group" aria-label="Inspect an interior layer"></div><p class="we-layer-explanation" aria-live="polite"></p><div class="we-detail"><strong class="we-process-title"></strong></div><p class="we-body we-process-detail"></p><p class="we-interior-source we-scene-caption"></p>';
    function draw(ctx, w, h) {
      ctx.fillStyle = PALETTE.bg; ctx.fillRect(0, 0, w, h); stars(ctx, w, h, .35);
      const data = INTERIORS[selected], cx = w / 2, cy = h * .49, r = Math.min(w * .32, h * .38);
      const halo = ctx.createRadialGradient(cx, cy, r * .7, cx, cy, r * 1.5); halo.addColorStop(0, data.colour + '40'); halo.addColorStop(1, data.colour + '00'); circle(ctx, cx, cy, r * 1.5, halo);
      if (selected === 'saturn') { ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.24); ctx.strokeStyle = '#d8c79b70'; ctx.lineWidth = r * .11; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.48, r * .34, 0, 0, TAU); ctx.stroke(); ctx.lineWidth = r * .035; ctx.strokeStyle = '#a99c7a88'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.65, r * .39, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
      circle(ctx, cx, cy, r, data.colour);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
      const rand = seeded(selected === 'earth' ? 8 : selected === 'venus' ? 34 : 52);
      for (let i = 0; i < 65; i++) {
        ctx.globalAlpha = .08 + rand() * .16;
        const px = cx + (rand() - .5) * r * 2, py = cy + (rand() - .5) * r * 2;
        if (data.diffuse) {
          ctx.fillStyle = i % 2 ? '#ead6ad' : '#18222b'; ctx.fillRect(cx - r, cy - r + i / 65 * r * 2, r * 2, r * .028);
        } else if (selected === 'moon' || selected === 'mercury') {
          ctx.strokeStyle = '#f2e7de'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, py, r * (.015 + rand() * .06), r * .028, 0, 0, TAU); ctx.stroke();
        } else if (selected === 'europa') {
          ctx.strokeStyle = '#594c41'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + r * .2, py + r * .16); ctx.lineTo(px + r * .32, py - r * .05); ctx.stroke();
        } else {
          ctx.fillStyle = i % 2 ? '#ead6ad' : '#18222b'; ctx.beginPath(); ctx.ellipse(px, py, r * (.04 + rand() * .12), r * (.02 + rand() * .07), rand() * 3, 0, TAU); ctx.fill();
        }
      }
      ctx.restore();
      if (cut > 0) {
        ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r + 1, -Math.PI / 2, -Math.PI / 2 + TAU * cut); ctx.closePath(); ctx.clip();
        data.layers.forEach((layer, i) => {
          if (data.diffuse && i) {
            const blend = ctx.createRadialGradient(cx, cy, r * layer.r * .8, cx, cy, r * Math.min(1, layer.r + .08));
            blend.addColorStop(0, layer.colour); blend.addColorStop(.4, layer.colour); blend.addColorStop(1, layer.colour + '00');
            circle(ctx, cx, cy, r * Math.min(1, layer.r + .08), blend);
          } else circle(ctx, cx, cy, r * layer.r, layer.colour);
        });
        const selectedLayer = data.layers[layerIndex];
        ctx.strokeStyle = '#fff0d7'; ctx.lineWidth = 2; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(cx, cy, r * selectedLayer.r - 1, 0, TAU); ctx.stroke();
        ctx.restore();
        const a = -Math.PI / 2 + TAU * cut;
        ctx.strokeStyle = '#f7e4c377'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
      }
      const shade = ctx.createRadialGradient(cx - r * .35, cy - r * .45, 0, cx + r * .25, cy + r * .25, r * 1.4); shade.addColorStop(0, '#fff4df12'); shade.addColorStop(.65, '#00000000'); shade.addColorStop(1, '#00000060'); circle(ctx, cx, cy, r, shade);
      text(ctx, data.name.toUpperCase(), 22, 29, 12, PALETTE.ivory);
      text(ctx, Math.round(cut * 100) + '% cutaway', w - 22, 29, 12, PALETTE.muted, 'right');
      text(ctx, data.layers[layerIndex].name, cx, h - 27, 15, PALETTE.ivory, 'center');
    }
    const view = stage(api, draw, .53);
    function layerButtons() {
      const list = api.root.querySelector('.we-layer-list'); list.innerHTML = '';
      INTERIORS[selected].layers.forEach((layer, i) => {
        const b = global.document.createElement('button'); b.type = 'button'; b.textContent = layer.name; b.setAttribute('aria-pressed', String(i === layerIndex)); list.appendChild(b);
        api.on(b, 'click', function () { layerIndex = i; Array.from(list.children).forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); update(); });
      });
    }
    function update() {
      const data = INTERIORS[selected];
      api.root.querySelector('.we-layer-explanation').textContent = data.layers[layerIndex].detail;
      api.root.querySelector('.we-process-title').textContent = data.processes;
      api.root.querySelector('.we-process-detail').textContent = data.detail;
      api.root.querySelector('.we-interior-source').innerHTML = '<a href="' + SOURCES[data.source].url + '" target="_blank" rel="noopener noreferrer">Evidence &amp; model context ↗</a>';
      api.canvas.setAttribute('aria-label', data.name + ', ' + Math.round(cut * 100) + ' percent cutaway. Selected layer: ' + data.layers[layerIndex].name + '. Diagram proportions are schematic.');
      view.render();
    }
    worldSelect(api, INTERIORS, selected, function (id) { selected = id; layerIndex = Math.min(layerIndex, INTERIORS[id].layers.length - 1); layerButtons(); update(); });
    range(api, 'Open the cutaway', 0, 1, .01, cut, function (v) { return Math.round(v * 100) + '%'; }, function (v) { cut = v; update(); });
    layerButtons(); update();
    return function () { view.cleanup(); api.cleanup(); };
  }

  function mountGravity(container) {
    let selected = 'moon', comparison = 'pair', speed = 12, angle = 45, time = 0, playing = false, last = null, raf = 0, rate = 1, probeTime = null, pinnedProbe = false, plot = null;
    const api = base(container, {
      kicker: 'Worlds / Gravity', title: 'One throw. Twelve worlds.',
      intro: 'Keep the throw identical. Compare gravity, pause a moment, or follow the arc yourself.',
      aria: 'A vacuum projectile comparison using a common metre scale and one elapsed time.',
      note: 'Same launch · same clock · equal metres on both axes · view fits the compared worlds',
      limit: 'Analytic vacuum ballistics with constant downward acceleration, flat reference plane and no bounce. Atmosphere, wind, curvature and Coriolis deflection are omitted. NASA metric-table gravity is equatorial effective acceleration, including the local rotational reduction; giant values refer to the 1 bar atmosphere, not solid ground. Europa, Titan and Pluto use the NASA Small Worlds table. Pluto’s 0.62 is corroborated by its detailed fact sheet; the metric summary instead lists 0.7. Every displayed path shares one distance scale and one elapsed time. Playback rate changes animation speed, never the physics.',
      sources: ['gravity', 'gravityNotes', 'smallGravity', 'plutoGravity', 'ballistic']
    });
    api.root.classList.add('we-gravity');
    api.content.innerHTML = '<div class="we-readout"><div><span class="we-g-label">Gravity</span><strong class="we-g"></strong></div><div><span class="we-range-label">Range</span><strong class="we-range-value"></strong></div><div><span class="we-air-label">Flight time</span><strong class="we-airtime"></strong></div></div><p class="we-reference" aria-live="polite"></p><div class="we-legend" aria-label="Visible trajectories"></div><details class="we-comparison"><summary>Compare all 12 worlds numerically</summary><div class="we-table-scroll"><table><caption>Identical launch speed and angle; vacuum model</caption><thead><tr><th>World</th><th>g (m/s²)</th><th>Range (m)</th><th>Time (s)</th></tr></thead><tbody></tbody></table></div></details>';
    const stageElement = api.root.querySelector('.we-stage');
    api.root.insertBefore(api.content.querySelector('.we-readout'), stageElement);
    const transport = global.document.createElement('div'); transport.className = 'we-transport';
    transport.innerHTML = '<div class="we-play-controls"><button type="button" class="we-play">▶ Play</button><button type="button" class="we-replay">↻ Replay</button><button type="button" class="we-rewind">Rewind</button><span class="we-number we-clock"></span><label class="we-rate">Playback <select aria-label="Playback rate"><option value="0.25">¼×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div><div class="we-time-control"></div><div class="we-live-position"></div>';
    api.root.insertBefore(transport, stageElement.nextSibling);
    const play = transport.querySelector('.we-play'), replay = transport.querySelector('.we-replay'), rewind = transport.querySelector('.we-rewind'), clock = transport.querySelector('.we-clock');
    const instructionId = 'we-probe-instruction-' + (++nextId);
    const instruction = global.document.createElement('p'); instruction.className = 'we-probe-instruction'; instruction.id = instructionId; instruction.textContent = 'Hover to inspect the selected arc. Tap the chart to scrub; use arrow keys when the chart is focused.';
    api.root.insertBefore(instruction, transport.nextSibling);
    const probe = global.document.createElement('div'); probe.className = 'we-probe'; probe.hidden = true; stageElement.appendChild(probe);
    api.canvas.tabIndex = 0; api.canvas.setAttribute('aria-describedby', instructionId);
    const options = id => ({ speed: speed, angleDeg: angle, gravity: GRAVITY[id].g, height: 0 });
    const compared = () => comparison === 'all' ? Object.keys(GRAVITY) : comparison === 'rocky' ? Array.from(new Set(['mercury', 'venus', 'earth', 'mars', selected])) : Array.from(new Set(['earth', selected]));
    const domain = () => comparisonDomain(compared(), speed, angle);
    const maxTime = () => domain().flightTime;
    let timeControl;
    function showProbe() {
      if (probeTime === null) { probe.hidden = true; return; }
      const p = projectileAt(probeTime, options(selected));
      probe.hidden = false;
      probe.innerHTML = '<strong>' + GRAVITY[selected].name + ' · ' + p.time.toFixed(2) + ' s</strong><span>Distance ' + p.x.toFixed(2) + ' m · Height ' + p.y.toFixed(2) + ' m</span><span>' + (p.landed ? 'At the reference plane' : 'Vertical speed ' + p.vy.toFixed(2) + ' m/s') + '</span>';
    }
    function draw(ctx, w, h) {
      ctx.fillStyle = PALETTE.bg; ctx.fillRect(0, 0, w, h);
      const left = 47, right = 24, top = 42, bottom = 47, stats = domain();
      const plotW = w - left - right, plotH = h - top - bottom;
      const maxX = Math.max(2, stats.range * 1.08), maxY = Math.max(1, stats.maxHeight * 1.24);
      const scale = Math.min(plotW / maxX, plotH / maxY), xMax = plotW / scale, yMax = plotH / scale;
      const px = x => left + x * scale, py = y => h - bottom - y * scale;
      plot = { left: left, right: w - right, top: top, bottom: h - bottom, scale: scale, width: w };
      ctx.strokeStyle = '#343544'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, h - bottom); ctx.lineTo(w - right, h - bottom); ctx.stroke();
      function tickSize(span) { const rough = span / 5, power = Math.pow(10, Math.floor(Math.log10(rough))); return [1, 2, 5, 10].find(n => n * power >= rough) * power; }
      const tick = tickSize(xMax), yTick = tickSize(yMax);
      const formatTick = value => Number(value.toPrecision(6)).toString();
      for (let x = 0; x <= xMax; x += tick) { ctx.beginPath(); ctx.moveTo(px(x), h - bottom); ctx.lineTo(px(x), h - bottom + 5); ctx.stroke(); text(ctx, formatTick(x), px(x), h - bottom + 22, 11, PALETTE.muted, 'center'); }
      for (let y = yTick; y < yMax; y += yTick) { ctx.globalAlpha = .48; ctx.beginPath(); ctx.moveTo(left, py(y)); ctx.lineTo(w - right, py(y)); ctx.stroke(); ctx.globalAlpha = 1; text(ctx, formatTick(y), left - 9, py(y) + 4, 11, PALETTE.muted, 'right'); }
      text(ctx, 'Height (m)', left, 24, 11, PALETTE.muted); text(ctx, 'Distance (m)', w - right, h - 9, 11, PALETTE.muted, 'right');
      const ordered = compared().filter(id => id !== selected).concat(selected);
      ordered.forEach(id => {
        const world = GRAVITY[id], duration = projectileStats(options(id)).flightTime;
        ctx.strokeStyle = world.colour; ctx.lineWidth = id === selected ? 2.5 : 1.5; ctx.globalAlpha = id === selected ? 1 : compared().length > 5 ? .32 : .7;
        ctx.setLineDash(id === selected ? [] : [4, 5]); ctx.beginPath();
        for (let i = 0; i <= 100; i++) { const p = projectileAt(duration * i / 100, options(id)); i ? ctx.lineTo(px(p.x), py(p.y)) : ctx.moveTo(px(p.x), py(p.y)); }
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        const current = projectileAt(time, options(id));
        if (id === selected) { const glow = ctx.createRadialGradient(px(current.x), py(current.y), 0, px(current.x), py(current.y), 19); glow.addColorStop(0, world.colour + '75'); glow.addColorStop(1, world.colour + '00'); circle(ctx, px(current.x), py(current.y), 19, glow); }
        ctx.globalAlpha = id === selected ? 1 : .7; circle(ctx, px(current.x), py(current.y), id === selected ? 5 : 3, world.colour); ctx.globalAlpha = 1;
      });
      if (probeTime !== null) {
        const p = projectileAt(probeTime, options(selected));
        ctx.setLineDash([2, 4]); ctx.strokeStyle = '#f3eadf77'; ctx.beginPath(); ctx.moveTo(px(p.x), py(0)); ctx.lineTo(px(p.x), py(p.y)); ctx.lineTo(left, py(p.y)); ctx.stroke(); ctx.setLineDash([]);
        circle(ctx, px(p.x), py(p.y), 4, PALETTE.bg); ctx.strokeStyle = PALETTE.ivory; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 5, 0, TAU); ctx.stroke();
      }
    }
    const view = stage(api, draw, .52);
    const gravityHelp = help(api, api.root.querySelector('.we-g-label'), 'gravity', '');
    help(api, api.root.querySelector('.we-range-label'), 'range', 'Horizontal distance from launch until the ball returns to the reference plane, in metres. The vacuum model ignores wind and drag.');
    help(api, api.root.querySelector('.we-air-label'), 'flight time', 'Elapsed physical seconds until the ball reaches the reference plane. All visible dots use the same clock; playback rate only changes how quickly you watch.');
    function updateMetrics() {
      const data = GRAVITY[selected], stats = projectileStats(options(selected));
      api.root.querySelector('.we-g').textContent = data.g + ' m/s²';
      api.root.querySelector('.we-range-value').textContent = stats.range.toFixed(1) + ' m';
      api.root.querySelector('.we-airtime').textContent = stats.flightTime.toFixed(2) + ' s';
      gravityHelp.textContent = data.name + ': ' + data.g + ' metres per second squared (' + (data.g / 9.8).toFixed(2) + ' × Earth). Reference: ' + data.reference + '. Values come from NASA’s ' + (data.source === 'smallGravity' ? 'Small Worlds' : 'metric planetary') + ' fact sheet.';
      api.content.querySelector('.we-reference').textContent = data.name + (data.reference === 'surface' ? ' · vacuum model using surface gravity.' : ' · gravity at the 1 bar atmosphere. There is no solid surface here; the baseline is an imaginary reference plane.');
      api.canvas.setAttribute('aria-label', 'Vacuum comparison. ' + data.name + ': range ' + stats.range.toFixed(1) + ' metres, flight time ' + stats.flightTime.toFixed(2) + ' seconds. Compared with ' + compared().filter(id => id !== selected).map(id => GRAVITY[id].name).join(', ') + '. All paths use the same metre scale. Arrow keys scrub; Space plays or pauses.');
      api.content.querySelector('.we-legend').innerHTML = compared().map(id => '<span' + (id === selected ? ' class="we-selected-legend"' : '') + '><i class="we-swatch" style="background:' + GRAVITY[id].colour + '"></i>' + GRAVITY[id].name + (id === selected ? ' · selected' : '') + '</span>').join('');
      api.content.querySelector('tbody').innerHTML = Object.keys(GRAVITY).map(id => { const s = projectileStats(options(id)); return '<tr' + (id === selected ? ' class="we-selected-row"' : '') + '><th scope="row">' + GRAVITY[id].name + (GRAVITY[id].reference !== 'surface' ? ' †' : '') + '</th><td>' + GRAVITY[id].g + '</td><td>' + s.range.toFixed(1) + '</td><td>' + s.flightTime.toFixed(2) + '</td></tr>'; }).join('');
      api.content.querySelector('caption').textContent = speed.toFixed(1) + ' m/s at ' + angle + '° · † at 1 bar, no solid surface';
    }
    function renderTime() {
      clock.textContent = time.toFixed(2) + ' / ' + maxTime().toFixed(2) + ' s';
      if (timeControl) timeControl.set(time);
      const p = projectileAt(time, options(selected));
      transport.querySelector('.we-live-position').textContent = GRAVITY[selected].name + ' now: ' + p.x.toFixed(1) + ' m across · ' + p.y.toFixed(1) + ' m high' + (p.landed ? ' · at the reference plane' : '');
      showProbe(); view.render();
    }
    function stop() { playing = false; if (raf) global.cancelAnimationFrame(raf); raf = 0; last = null; play.textContent = time >= maxTime() - .0001 ? '▶ Play again' : time > 0 ? '▶ Resume' : '▶ Play'; play.setAttribute('aria-pressed', 'false'); }
    function step(now) {
      if (!playing || api.isDisposed()) return;
      if (last !== null && !global.document.hidden) time = Math.min(maxTime(), time + Math.min(.1, (now - last) / 1000) * rate);
      last = now; renderTime();
      if (time >= maxTime()) stop(); else raf = global.requestAnimationFrame(step);
    }
    function start() { if (time >= maxTime()) time = 0; probeTime = null; pinnedProbe = false; playing = true; last = null; play.textContent = 'Ⅱ Pause'; play.setAttribute('aria-pressed', 'true'); raf = global.requestAnimationFrame(step); }
    function toggle() { if (playing) stop(); else start(); }
    function resetFlight() { time = 0; probeTime = null; pinnedProbe = false; stop(); if (timeControl) { timeControl.input.max = String(maxTime()); timeControl.set(0); } updateMetrics(); renderTime(); }
    function reconfigure() { stop(); time = Math.min(time, maxTime()); probeTime = null; pinnedProbe = false; timeControl.input.max = String(maxTime()); updateMetrics(); renderTime(); stop(); }
    api.on(play, 'click', toggle);
    api.on(replay, 'click', function () { resetFlight(); start(); });
    api.on(rewind, 'click', resetFlight);
    api.on(transport.querySelector('.we-rate select'), 'change', function (event) { rate = Number(event.target.value); });
    api.on(global.document, 'visibilitychange', function () { if (global.document.hidden && playing) stop(); });
    const reduced = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (reduced && reduced.addEventListener) api.on(reduced, 'change', function () { if (reduced.matches) stop(); });
    worldSelect(api, GRAVITY, selected, function (id) { selected = id; reconfigure(); });
    const compareField = global.document.createElement('label'); compareField.className = 'we-compare-select'; compareField.innerHTML = '<span>Compare</span><select aria-label="Worlds to compare"><option value="pair">Selected + Earth</option><option value="rocky">Rocky planets + selected</option><option value="all">All 12 worlds</option></select>'; api.worlds.appendChild(compareField);
    api.on(compareField.querySelector('select'), 'change', function (event) { comparison = event.target.value; reconfigure(); });
    range(api, 'Launch speed', 4, 25, .5, speed, function (v) { return v.toFixed(1) + ' m/s'; }, function (v) { speed = v; resetFlight(); });
    range(api, 'Launch angle', 10, 80, 1, angle, function (v) { return v + '° above horizontal'; }, function (v) { angle = v; resetFlight(); });
    timeControl = range(api, 'Scrub elapsed time', 0, maxTime(), .01, 0, function (v) { return v.toFixed(2) + ' s'; }, function (v) { time = clamp(v, 0, maxTime()); probeTime = null; pinnedProbe = false; stop(); renderTime(); }, transport.querySelector('.we-time-control'));
    function inspect(event, commit) {
      if (!plot) return;
      const rect = api.canvas.getBoundingClientRect(), x = (event.clientX - rect.left) * plot.width / rect.width;
      const vx = speed * Math.cos(angle * Math.PI / 180);
      probeTime = clamp((x - plot.left) / plot.scale / vx, 0, projectileStats(options(selected)).flightTime);
      if (commit) { stop(); time = probeTime; pinnedProbe = true; renderTime(); stop(); } else { showProbe(); view.render(); }
    }
    api.on(api.canvas, 'pointermove', function (event) { if (event.pointerType !== 'touch' && !pinnedProbe) inspect(event, false); });
    api.on(api.canvas, 'pointerleave', function () { if (!pinnedProbe) { probeTime = null; showProbe(); view.render(); } });
    api.on(api.canvas, 'click', function (event) { inspect(event, true); });
    api.on(api.canvas, 'keydown', function (event) {
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); toggle(); return; }
      if (event.key === 'Escape') { probeTime = null; pinnedProbe = false; showProbe(); view.render(); return; }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); stop(); time = event.key === 'Home' ? 0 : event.key === 'End' ? maxTime() : clamp(time + (event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? 1 : .1), 0, maxTime()); probeTime = null; pinnedProbe = false; renderTime(); stop();
      }
    });
    updateMetrics(); renderTime(); stop();
    return function () { stop(); view.cleanup(); api.cleanup(); };
  }

  function mountPastEarth(container) {
    let kind = 'divergent', progress = .35, historical = 1, playing = false, raf = 0, last = null;
    const api = base(container, {
      kicker: 'Worlds / Deep time', title: 'A planet that won’t sit still',
      intro: 'Open an ocean basin, grow a volcanic arc, or watch a river become offset across a fault.',
      aria: 'An interactive geological process illustration, not reconstructed palaeogeography.',
      note: 'Geological process illustration · schematic geometry · progress is a sequence, not elapsed years',
      limit: 'These diagrams show idealised divergent, oceanic–continental convergent and transform boundaries. Animation progress has no conversion to years, distance, energy or tectonic rate. The mantle is predominantly solid rock that deforms over long times; coloured rising material denotes local melt generation. Historical markers are independent context, not dates assigned to a sketch. No coastlines, palaeocoordinates or place-specific history are reconstructed.',
      sources: ['boundaries', 'pangea', 'earth', 'ics', 'gplates']
    });
    api.content.innerHTML = '<div class="we-detail"><strong class="we-boundary-label"></strong><span class="we-view-label"></span></div><p class="we-body we-boundary-explanation" aria-live="polite"></p><details class="we-geological-context"><summary>Historical reference points</summary><p>These dates provide context; they do not set the age of the process drawing.</p><div class="we-timeline" role="group" aria-label="Geological time reference points"></div><div class="we-history" aria-live="polite"></div></details>';
    const sequences = {
      divergent: [
        ['Stretching crust', 'The crust thins and a rift begins. The two sides move apart; rising mantle can partially melt as pressure falls.'],
        ['Opening a basin', 'The rift widens and subsides. In this idealised sequence, seawater enters while new crust is added near the centre.'],
        ['An ocean is growing', 'An ocean basin separates the continental margins. New crust forms near the spreading centre and is carried away on both sides.']
      ],
      convergent: [
        ['A plate bends downward', 'The denser oceanic plate begins to descend below the continental margin, making a trench.'],
        ['A slab sinks deeper', 'The descending plate carries water-bearing material into depth. Released water can help nearby mantle rock partially melt.'],
        ['An arc rises', 'Magma can reach the overriding plate and build volcanoes. This is an ocean–continent subduction example, not every kind of plate collision.']
      ],
      transform: [
        ['Matching landmarks', 'Imagine a river and bands of rock that originally continue across this boundary.'],
        ['The river is offset', 'Sideways movement shifts the two halves in opposite directions. Follow the blue channel to see the accumulated displacement.'],
        ['A longer displacement', 'Landmarks record the relative slip. This illustration adds no new crust and removes none at the fault.']
      ]
    };
    function draw(ctx, w, h) {
      const f = tectonicFrame(kind, progress), surface = h * .39, baseY = h * .69;
      const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#111826'); sky.addColorStop(.45, '#253342'); sky.addColorStop(1, '#3e3036'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      if (kind !== 'transform') {
        const mantle = ctx.createLinearGradient(0, surface, 0, h); mantle.addColorStop(0, '#4c3941'); mantle.addColorStop(1, '#775345'); ctx.fillStyle = mantle; ctx.fillRect(0, surface + 15, w, h);
        for (let row = 0; row < 5; row++) { ctx.strokeStyle = '#c9986a13'; ctx.beginPath(); ctx.moveTo(0, baseY + row * 16); ctx.bezierCurveTo(w * .3, baseY - 6 + row * 16, w * .6, baseY + 9 + row * 16, w, baseY + row * 16); ctx.stroke(); }
      }
      if (kind === 'divergent') {
        const gap = w * f.gap, left = w * .5 - gap / 2, right = w * .5 + gap / 2, floor = surface + h * f.depth;
        const bank = Math.min(40, w * .08);
        polygon(ctx, [[0, surface - 10], [left - bank, surface - 15], [left, floor], [left, baseY], [0, baseY]], '#66515a');
        polygon(ctx, [[right, floor], [right + bank, surface - 15], [w, surface - 10], [w, baseY], [right, baseY]], '#796069');
        polygon(ctx, [[left, floor], [w / 2, floor - 10], [right, floor], [right, baseY + 8], [left, baseY + 8]], '#805e53');
        if (progress > .22) {
          const waterTop = floor - Math.min(h * .1, (progress - .22) * h * .15);
          const water = ctx.createLinearGradient(0, waterTop, 0, floor); water.addColorStop(0, '#57899fbb'); water.addColorStop(1, '#294658dd');
          polygon(ctx, [[left, waterTop], [right, waterTop], [right, floor], [w / 2, floor - 10], [left, floor]], water);
          ctx.strokeStyle = '#aacbd580'; ctx.beginPath(); ctx.moveTo(left, waterTop); ctx.lineTo(right, waterTop); ctx.stroke();
        }
        const shift = progress * w * .13;
        ctx.strokeStyle = '#b7978a77'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) { const y = surface + 20 + i * 14; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Math.max(0, left - bank * .6), y + 5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(Math.min(w, right + bank * .6), y + 5); ctx.lineTo(w, y); ctx.stroke(); }
        polygon(ctx, [[w / 2 - 8, baseY + 30], [w / 2 - 3, floor - 5], [w / 2 + 3, floor - 5], [w / 2 + 8, baseY + 30]], '#df9b70');
        ctx.strokeStyle = '#efc49b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(w / 2 - Math.max(4, shift), floor + 2); ctx.lineTo(w / 2, floor - 10); ctx.lineTo(w / 2 + Math.max(4, shift), floor + 2); ctx.stroke();
        for (let i = 1; i < 6; i++) { const dx = gap * .43 * i / 6; ctx.strokeStyle = '#d2a28440'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w / 2 - dx, floor + 8); ctx.lineTo(w / 2 - dx, baseY); ctx.moveTo(w / 2 + dx, floor + 8); ctx.lineTo(w / 2 + dx, baseY); ctx.stroke(); }
        arrow(ctx, left - 12, surface - 45, Math.max(18, left - 65), surface - 45, PALETTE.lavender);
        arrow(ctx, right + 12, surface - 45, Math.min(w - 18, right + 65), surface - 45, PALETTE.lavender);
        text(ctx, progress < .4 ? 'A widening rift' : 'New crust at the spreading centre', w / 2, h - 28, w < 400 ? 11 : 12, '#f3d6bb', 'center');
      } else if (kind === 'convergent') {
        const joint = w * .43, relief = h * f.relief, slabX = joint + w * (.1 + progress * .23), slabY = surface + h * f.slabDepth;
        polygon(ctx, [[0, surface + 13], [joint, surface + 13], [slabX, slabY], [slabX - 17, slabY + 21], [joint - 12, baseY], [0, baseY]], '#575363');
        polygon(ctx, [[joint + 10, surface + 21], [joint + w * .14, surface - relief], [joint + w * .19, surface - relief * .55], [joint + w * .28, surface - 6], [w, surface - 5], [w, baseY + 8], [slabX + 19, baseY + 8]], '#80606a');
        ctx.fillStyle = '#385b72'; ctx.fillRect(0, surface - 10, joint - 4, 21);
        ctx.strokeStyle = '#dcad8e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, surface + 13); ctx.lineTo(joint, surface + 13); ctx.lineTo(slabX, slabY); ctx.stroke();
        const volcanoX = joint + w * .14;
        if (progress > .3) {
          const magmaTop = surface - relief + 9, meltY = surface + h * .22;
          ctx.strokeStyle = '#e1a476'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(volcanoX + 15, meltY); ctx.quadraticCurveTo(volcanoX - 8, surface + 20, volcanoX, magmaTop); ctx.stroke();
          circle(ctx, volcanoX + 15, meltY, 6 + progress * 5, '#d7966a77');
          if (progress > .65) { ctx.fillStyle = '#d5c8b259'; for (let i = 0; i < 4; i++) circle(ctx, volcanoX + i * 3, surface - relief - 5 - i * 8, 3 + i * 2, '#c1b8ad50'); }
        }
        arrow(ctx, 25, surface - 43, Math.min(joint - 24, 100), surface - 43, PALETTE.lavender);
        arrow(ctx, w - 24, surface - 36, w - Math.min(100, w * .2), surface - 36, PALETTE.lavender);
        arrow(ctx, joint + 16, surface + 35, slabX - 4, slabY - 9, PALETTE.copper);
        text(ctx, 'Descending oceanic plate · growing volcanic arc', w / 2, h - 28, w < 470 ? 10 : 12, '#f3d6bb', 'center');
      } else {
        ctx.fillStyle = '#3f4243'; ctx.fillRect(0, 0, w, h);
        polygon(ctx, [[0, 0], [w * .49, 0], [w * .49, h], [0, h]], '#52615b');
        polygon(ctx, [[w * .51, 0], [w, 0], [w, h], [w * .51, h]], '#62655b');
        const offset = f.offset * h;
        for (let side = 0; side < 2; side++) {
          const x0 = side ? w * .51 : 0, x1 = side ? w : w * .49, dy = side ? offset : -offset;
          ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, h); ctx.clip();
          ctx.strokeStyle = '#b4a48855'; ctx.lineWidth = 1.5;
          for (let i = -3; i < 12; i++) { const y = i * h * .13 + dy; ctx.beginPath(); ctx.moveTo(x0, y); ctx.bezierCurveTo(x0 + w * .2, y - 22, x1 - w * .1, y + 16, x1, y); ctx.stroke(); }
          const riverY = h * .5 + dy; ctx.strokeStyle = '#7397a1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, riverY); ctx.bezierCurveTo(x0 + w * .16, riverY - 20, x1 - w * .13, riverY + 20, x1, riverY); ctx.stroke();
          ctx.strokeStyle = '#c2d8d4'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
        }
        ctx.strokeStyle = '#e2a47d'; ctx.lineWidth = 1.5; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); ctx.setLineDash([]);
        if (progress > .05) { ctx.strokeStyle = '#c3b0f070'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w * .49, h * .5 - offset); ctx.lineTo(w * .51, h * .5 + offset); ctx.stroke(); }
        arrow(ctx, w * .25, h * .62, w * .25, h * .33, '#f0d9c6'); arrow(ctx, w * .75, h * .33, w * .75, h * .62, '#f0d9c6');
        text(ctx, 'Follow the offset river', w / 2, h - 28, 12, '#ffe0bf', 'center');
      }
      text(ctx, f.view.toUpperCase(), 18, 26, 10, PALETTE.ivory); text(ctx, 'SCHEMATIC', w - 18, 26, 10, PALETTE.muted, 'right');
    }
    const view = stage(api, draw, .5);
    const play = global.document.createElement('button'); play.type = 'button'; play.textContent = '▶ Play sequence'; play.className = 'we-process-play';
    const rewind = global.document.createElement('button'); rewind.type = 'button'; rewind.textContent = 'Rewind'; api.controls.appendChild(play); api.controls.appendChild(rewind);
    let slider;
    function update() {
      const f = tectonicFrame(kind, progress), index = progress < .3 ? 0 : progress < .68 ? 1 : 2, part = sequences[kind][index];
      api.content.querySelector('.we-boundary-label').textContent = part[0]; api.content.querySelector('.we-view-label').textContent = f.view;
      api.content.querySelector('.we-boundary-explanation').textContent = part[1];
      api.canvas.setAttribute('aria-label', f.label + '. ' + part[0] + '. Schematic ' + f.view.toLowerCase() + '. ' + part[1]);
      if (slider) slider.set(progress); if (!playing) play.textContent = progress >= 1 ? '↻ Replay sequence' : '▶ Play sequence'; view.render();
    }
    function stop() { playing = false; if (raf) global.cancelAnimationFrame(raf); raf = 0; last = null; play.textContent = progress >= 1 ? '↻ Replay sequence' : '▶ Play sequence'; play.setAttribute('aria-pressed', 'false'); }
    function step(now) { if (!playing || api.isDisposed()) return; if (last !== null) progress = Math.min(1, progress + Math.min(.1, (now - last) / 1000) / 12); last = now; update(); if (progress >= 1) stop(); else raf = global.requestAnimationFrame(step); }
    api.on(play, 'click', function () { if (playing) { stop(); return; } if (progress >= 1) progress = 0; playing = true; last = null; play.textContent = 'Ⅱ Pause sequence'; play.setAttribute('aria-pressed', 'true'); raf = global.requestAnimationFrame(step); });
    api.on(rewind, 'click', function () { stop(); progress = 0; update(); });
    api.on(global.document, 'visibilitychange', function () { if (global.document.hidden) stop(); });
    const reduced = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (reduced && reduced.addEventListener) api.on(reduced, 'change', function () { if (reduced.matches) stop(); });
    worldButtons(api, [{ id: 'divergent', label: 'Open an ocean' }, { id: 'convergent', label: 'Build an arc' }, { id: 'transform', label: 'Offset the land' }], kind, function (id) { stop(); kind = id; progress = 0; update(); });
    slider = range(api, 'Scrub the process', 0, 1, .005, progress, function (v) { return Math.round(v * 100) + '% through sequence'; }, function (v) { stop(); progress = v; update(); });
    const timeline = api.content.querySelector('.we-timeline');
    function showHistory() { const item = HISTORY[historical]; api.content.querySelector('.we-history').innerHTML = '<strong>' + item.title + '</strong><p>' + item.text + '</p>'; Array.from(timeline.children).forEach((b, i) => b.setAttribute('aria-pressed', String(i === historical))); }
    HISTORY.forEach((item, i) => { const button = global.document.createElement('button'); button.type = 'button'; button.innerHTML = (item.age === 0 ? 'Today' : (item.age === 66 ? '' : '≈ ') + item.age + ' Ma') + '<small>' + item.name + '</small>'; button.setAttribute('aria-pressed', String(i === historical)); timeline.appendChild(button); api.on(button, 'click', function () { historical = i; showHistory(); }); });
    showHistory(); update(); stop();
    return function () { stop(); view.cleanup(); api.cleanup(); };
  }

  function mount(mode, container) {
    if (!global.document) throw new Error('Mounting exhibits requires a browser document');
    const mounts = { 'past-earth': mountPastEarth, surfaces: mountSurfaces, interiors: mountInteriors, gravity: mountGravity };
    if (!Object.prototype.hasOwnProperty.call(mounts, mode)) throw new RangeError('Unknown world exhibit: ' + mode);
    return mounts[mode](container);
  }
  const models = Object.freeze({ GRAVITY: GRAVITY, SURFACES: SURFACES, INTERIORS: INTERIORS, GEOLOGICAL_PERIODS: GEOLOGICAL_PERIODS, worldGravity: worldGravity, projectileStats: projectileStats, projectileAt: projectileAt, comparisonDomain: comparisonDomain, WORLD_GROUPS: WORLD_GROUPS, normalisePhase: normalisePhase, daylightAt: daylightAt, periodAt: periodAt, tectonicFrame: tectonicFrame });
  const api = Object.freeze({ mount: mount, models: models, sources: SOURCES });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global.document) global.WorldExhibits = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
