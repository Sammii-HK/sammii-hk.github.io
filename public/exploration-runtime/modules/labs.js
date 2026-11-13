(function (global) {
  'use strict';

  const PI = Math.PI;
  const TAU = 2 * PI;
  const C = Object.freeze({ bg: '#10121b', panel: '#171a25', line: '#363644', text: '#f3eadf', muted: '#b9b5c2', copper: '#e2a47d', lavender: '#c3b0f0', blue: '#8cbee2', mint: '#a2cdc1' });
  const CONSTANTS = Object.freeze({ h: 6.62607015e-34, hbar: 6.62607015e-34 / TAU, electronMass: 9.1093837139e-31, eV: 1.602176634e-19, criticalImpact: 3 * Math.sqrt(3) / 2 });
  const SOURCES = Object.freeze({
    relativity: { title: 'MIT 8.033 · Schwarzschild metric, photon orbits and black holes', url: 'https://ocw.mit.edu/courses/8-033-relativity-fall-2006/5dae4a0c2d69b367951ddea5e17a2cea_schwarzschild.pdf' },
    diffraction: { title: 'OpenStax · Double-slit diffraction', url: 'https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction' },
    quantum: { title: 'Caltech · The Feynman Lectures, Quantum Behavior', url: 'https://www.feynmanlectures.caltech.edu/III_01.html' },
    barrier: { title: 'University of Texas at Austin · Square potential barrier', url: 'https://farside.ph.utexas.edu/teaching/qmech/Quantum/node48.html' },
    uncertainty: { title: 'University of Texas at Austin · Position–momentum uncertainty', url: 'https://farside.ph.utexas.edu/teaching/qmech/Quantum/node39.html' },
    packets: { title: 'University of Texas at Austin · Wave packets', url: 'https://farside.ph.utexas.edu/teaching/qmech/Quantum/node25.html' },
    evolution: { title: 'MIT 8.04 · Free Gaussian wavepacket evolution', url: 'https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/6ca5bd79a2121967796f7c0b8f6f48c9_MIT8_04S16_LecNotes7.pdf' },
    membrane: { title: 'Penn State Acoustics · Rectangular membrane modes', url: 'https://www.acs.psu.edu/drussell/Demos/rect-membrane/rect-mem.html' },
    constants: { title: 'NIST · CODATA 2022 fundamental constants', url: 'https://physics.nist.gov/cuu/Constants/' },
    grayScott: { title: 'John E. Pearson · Complex Patterns in a Simple System (1993)', url: 'https://arxiv.org/abs/patt-sol/9304003' },
    grayScottMIT: { title: 'MIT CSAIL · Gray–Scott reaction–diffusion model', url: 'https://groups.csail.mit.edu/mac/projects/amorphous/GrayScott/' }
  });
  const MODES = Object.freeze({
    'black-hole-light': { title: 'Where light can go', kicker: 'Relativity / 01', intro: 'Aim a beam past a black hole. A tiny change in its approach can turn an escape into a long loop — or a one-way crossing.', caption: 'A map of light paths outside a non-rotating black hole. Path tracing is not a travel-time clock.', notes: 'The numerical paths solve the Schwarzschild null-geodesic equation u″ + u = 3u²/2, with u = rₛ/r and impact parameter b measured in rₛ. The event horizon is r = rₛ; the unstable photon sphere is r = 1.5 rₛ. Incoming light from infinity is captured for b < 3√3 rₛ/2. Paths stop at the horizon; no interior emission is depicted. This is a polar-coordinate path map with equal horizontal and vertical scale, not a telescope image or a map of proper spatial distance. Rotation, accretion, redshift and wave optics are omitted. Glow and background marks are original visual styling.', sources: ['relativity'] },
    'double-slit': { title: 'One arrival at a time', kicker: 'Quantum / 02', intro: 'Let individual detections gather into a pattern. Then make the two paths distinguishable and watch the fringes disappear.', caption: 'Ideal far-field diffraction. Each dot is a sampled detector event; the curve is its probability density.', notes: 'Two equally illuminated, identical rectangular slits are modelled in the paraxial far field. The single-slit envelope is sinc²(πay/λL). Coherent light has the factor [1 + cos(2πdy/λL)]/2. With an ideal which-path record, orthogonal detector states remove the cross term and the envelope remains. We assume the path-recording interaction leaves each single-slit envelope unchanged. This is a model of distinguishability, not a claim about consciousness. Events are sampled independently from the normalised distribution within the displayed detector window; vertical speckle positions are decorative. Finite detector efficiency and exact near-field propagation are omitted.', sources: ['diffraction', 'quantum'] },
    tunnelling: { title: 'Through the forbidden', kicker: 'Quantum / 03', intro: 'Make a barrier taller or wider. An electron below its height can still have a non-zero chance of appearing on the other side.', caption: 'Exact stationary scattering by a one-dimensional rectangular barrier. The wave is an amplitude, not a particle trajectory.', notes: 'An electron of a single energy E meets a finite rectangular potential of height V₀ and width a; potential is zero on both sides. The wavefunction and its derivative are matched at both boundaries. Transmission is a probability-current ratio, with reflection R = 1 − T. Below the barrier, the interior solution is evanescent; above it, interference can produce full-transmission resonances. The E = V₀ limit is treated continuously. Energy is conserved: tunnelling does not require borrowing energy. The phase control animates Re ψ at a deliberately slowed display rate; this stationary solution does not describe a localised arrival or a traversal time.', sources: ['barrier', 'constants'] },
    uncertainty: { title: 'A little less certain', kicker: 'Quantum / 04', intro: 'Squeeze a wavepacket into a smaller place. Its possible momenta spread out. Release it, and the position distribution broadens with time.', caption: 'A free electron, initially in a minimum-uncertainty Gaussian state. The two plots describe separate measurement distributions.', notes: 'At preparation, σₓσₚ = ħ/2. Under free-particle evolution, σₓ(t) = σₓ(0) √[1 + (ħt / 2mσₓ(0)²)²], while σₚ is unchanged. The state develops position–momentum correlations, so σₓ(t)σₚ becomes greater than ħ/2. Narrowing the preparation control creates a new state and resets its clock. These spreads are properties of a state across repeated preparations, not a simultaneous joint measurement or just instrument error. The mean position and mean momentum are zero. Position is in nm, time in fs, and momentum in ħ/nm; the plotted probability-density scales stay fixed.', sources: ['uncertainty', 'packets', 'evolution', 'constants'] },
    'sound-patterns': { title: 'The shape of a note', kicker: 'Waves / 05', intro: 'Two vibrations can share a frequency and still draw different shapes. Blend them and find the quiet lines that never move.', caption: 'An ideal square membrane with fixed edges. Bright contours mark nodes; the colour field shows signed displacement.', notes: 'The analytic shapes are sin(mπx/L) sin(nπy/L). On a square, modes (m,n) and (n,m) have the same frequency f = c√(m²+n²)/(2L), so their real superposition is also a normal mode. The blend uses coefficients cos θ and sin θ, including negative values. L = 0.4 m and c = 80 m/s are illustrative parameters, not measurements of an instrument. Displacement is exaggerated and playback is slowed to 0.35 cycles per second. Nodal contours are computed from the mode amplitude and remain fixed throughout the oscillation. This is a membrane model, not a flexural metal-plate simulation or a simulation of grains of sand. Optional audio is a quiet pure sine at the displayed frequency, not a recording of a real membrane.', sources: ['membrane'] },
    'living-patterns': { title: 'Patterns that grow', kicker: 'Emergence / 06', intro: 'Paint a small disturbance into a chemical world. Spots divide, stripes meet, and coral-like edges grow from the same two equations.', caption: 'Gray–Scott reaction–diffusion, in dimensionless units. Colour follows simulated concentrations; these are mathematical patterns, not living organisms.', notes: 'Two fields obey ∂U/∂t = Dᵤ∇²U − UV² + F(1−U) and ∂V/∂t = Dᵥ∇²V + UV² − (F+k)V. The model represents autocatalysis and feed/removal. Here Dᵤ = 0.16, Dᵥ = 0.08, grid spacing = 1, and a five-point Laplacian uses periodic boundaries: opposite edges join. Explicit Euler steps are at most Δt = 0.5; a positivity bound reduces the step when necessary. Concentrations are not artificially clipped by the solver. Presets start from deterministic finite seeds and are evolved for 3200 steps before display; the readout shows that elapsed model time. Reset returns to t = 0. Painting replaces a local region with U = 0.5, V = 0.5, so it is an intervention. Spots, stripes and coral are visual preset names, not guarantees for every initial condition or claims about biological mechanisms. The palette is an original rendering of V.', sources: ['grayScott', 'grayScottMIT'] }
  });

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  function finite(value, name) { if (!Number.isFinite(value)) throw new RangeError(name + ' must be finite'); return value; }
  function positive(value, name) { finite(value, name); if (value <= 0) throw new RangeError(name + ' must be positive'); return value; }
  function nonnegative(value, name) { finite(value, name); if (value < 0) throw new RangeError(name + ' must not be negative'); return value; }
  function sinc(x) { return Math.abs(x) < 1e-5 ? 1 - x * x / 6 + x ** 4 / 120 : Math.sin(x) / x; }
  function seededRandom(seed) { let s = seed >>> 0; return function () { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // Schwarzschild null geodesics, r_s = 1. The map uses areal radius, not a Euclidean spatial metric.
  function traceSchwarzschild(impact, options) {
    const b = nonnegative(Math.abs(finite(impact, 'impact parameter')), 'impact parameter');
    const sign = impact < 0 ? -1 : 1;
    const opts = options || {};
    const startRadius = opts.startRadius === undefined ? Math.max(40, b * 20) : positive(opts.startRadius, 'start radius');
    if (startRadius <= 2 || b >= startRadius / Math.sqrt(1 - 1 / startRadius)) throw new RangeError('start radius must be outside the horizon and incoming turning point');
    const step = opts.step === undefined ? .0025 : positive(opts.step, 'angular step');
    if (step > .02) throw new RangeError('angular step must be at most 0.02 radians');
    if (b === 0) {
      const points = Array.from({ length: 501 }, (_, i) => { const r = startRadius - (startRadius - 1) * i / 500; return { x: -r, y: 0, r, phi: 0, u: 1 / r, v: 0 }; });
      return { impact, points, outcome: 'captured', closestRadius: 1, deflection: null, invariantError: 0 };
    }
    const u0 = 1 / startRadius;
    const invariant = 1 / (b * b);
    // Incoming asymptote from infinity to r0, using Simpson quadrature.
    let phi0 = 0;
    for (let j = 0; j <= 80; j++) {
      const u = u0 * j / 80;
      phi0 += (j === 0 || j === 80 ? 1 : j % 2 ? 4 : 2) / Math.sqrt(invariant - u * u + u * u * u);
    }
    phi0 *= u0 / 240;
    let u = u0, v = Math.sqrt(invariant - u0 * u0 + u0 ** 3), phi = phi0;
    const critical = Math.abs(b - CONSTANTS.criticalImpact) <= 1e-11;
    const maxAngle = critical ? 12 : 32;
    let outcome = critical ? 'critical' : 'unresolved';
    let minR = startRadius, invariantError = 0;
    const points = [];
    const push = () => { const r = 1 / u; minR = Math.min(minR, r); points.push({ x: -r * Math.cos(phi), y: sign * r * Math.sin(phi), r, phi, u, v }); };
    push();
    const accel = q => -q + 1.5 * q * q;
    while (phi - phi0 < maxAngle) {
      const oldU = u, oldV = v, oldPhi = phi;
      const k1u = v, k1v = accel(u);
      const k2u = v + step * k1v / 2, k2v = accel(u + step * k1u / 2);
      const k3u = v + step * k2v / 2, k3v = accel(u + step * k2u / 2);
      const k4u = v + step * k3v, k4v = accel(u + step * k3u);
      u += step * (k1u + 2 * k2u + 2 * k3u + k4u) / 6;
      v += step * (k1v + 2 * k2v + 2 * k3v + k4v) / 6;
      phi += step;
      invariantError = Math.max(invariantError, Math.abs(v * v + u * u - u * u * u - invariant));
      if (u >= 1) {
        const f = (1 - oldU) / (u - oldU);
        phi = oldPhi + f * step; v = oldV + f * (v - oldV); u = 1;
        outcome = 'captured'; push(); break;
      }
      if (u <= u0 && v < 0) {
        const f = (u0 - oldU) / (u - oldU);
        phi = oldPhi + f * step; v = oldV + f * (v - oldV); u = u0;
        outcome = 'escaped'; push(); break;
      }
      push();
    }
    // Exactly critical rays approach the unstable circular orbit asymptotically.
    return { impact, points, outcome, closestRadius: minR, deflection: outcome === 'escaped' ? phi + phi0 - PI : null, invariantError };
  }

  // Paraxial Fraunhofer model. All geometry is in SI units here.
  function diffractionIntensity(y, config) {
    const wavelength = positive(config.wavelength, 'wavelength');
    const slitWidth = positive(config.slitWidth, 'slit width');
    const separation = positive(config.separation, 'slit separation');
    const distance = positive(config.distance, 'screen distance');
    const coherence = config.coherence === undefined ? 1 : finite(config.coherence, 'coherence');
    if (coherence < 0 || coherence > 1) throw new RangeError('coherence must be in [0,1]');
    if (slitWidth > separation) throw new RangeError('slits must not overlap');
    const angle = finite(y, 'screen position') / distance;
    return sinc(PI * slitWidth * angle / wavelength) ** 2 * (1 + coherence * Math.cos(TAU * separation * angle / wavelength)) / 2;
  }
  function detectorDistribution(config, halfWidth, bins) {
    positive(halfWidth, 'detector half width');
    if (!Number.isInteger(bins) || bins < 2) throw new RangeError('at least two detector bins required');
    const dx = 2 * halfWidth / bins;
    const weights = Array.from({ length: bins }, (_, i) => diffractionIntensity(-halfWidth + (i + .5) * dx, config));
    const sum = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    const cdf = weights.map(w => (acc += w / sum));
    cdf[cdf.length - 1] = 1;
    return { probabilities: weights.map(w => w / sum), density: weights.map(w => w / (sum * dx)), cdf, halfWidth, dx, bins };
  }
  function sampleDetector(distribution, randomValue) {
    const u = clamp(finite(randomValue, 'sample'), 0, 1 - Number.EPSILON);
    let lo = 0, hi = distribution.cdf.length - 1;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (u < distribution.cdf[mid]) hi = mid; else lo = mid + 1; }
    const before = lo === 0 ? 0 : distribution.cdf[lo - 1];
    const within = (u - before) / (distribution.cdf[lo] - before || 1);
    return -distribution.halfWidth + (lo + within) * distribution.dx;
  }

  // hbar^2/(2 m_e), in eV nm^2. E and V in eV, a and x in nm.
  const ELECTRON_KINETIC = CONSTANTS.hbar ** 2 / (2 * CONSTANTS.electronMass) / CONSTANTS.eV * 1e18;
  function barrierTransmission(energy, height, width) {
    positive(energy, 'energy'); nonnegative(height, 'barrier height'); nonnegative(width, 'barrier width');
    if (height === 0 || width === 0) return 1;
    const delta = energy - height;
    // sinc/sinhc form avoids catastrophic 0/0 at E = V0.
    const z2 = Math.abs(delta) / ELECTRON_KINETIC * width * width;
    const z = Math.sqrt(z2);
    const base = height * height * width * width / (4 * energy * ELECTRON_KINETIC);
    if (z < 1e-5) {
      const ratio = 1 + (delta < 0 ? 1 : -1) * z2 / 6 + z2 * z2 / 120;
      return 1 / (1 + base * ratio * ratio);
    }
    if (delta >= 0) return 1 / (1 + base * sinc(z) ** 2);
    if (z > 20) {
      const logSinh = z - Math.log(2) + Math.log1p(-Math.exp(-2 * z));
      const logTerm = Math.log(base) + 2 * (logSinh - Math.log(z));
      return logTerm > 745 ? 0 : 1 / (1 + Math.exp(logTerm));
    }
    return 1 / (1 + base * (Math.sinh(z) / z) ** 2);
  }
  function complexDivide(ar, ai, br, bi) { const d = br * br + bi * bi; return { re: (ar * br + ai * bi) / d, im: (ai * br - ar * bi) / d }; }
  function complexMultiply(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
  function stationaryBarrier(energy, height, width) {
    positive(energy, 'energy'); nonnegative(height, 'barrier height'); nonnegative(width, 'barrier width');
    const k = Math.sqrt(energy / ELECTRON_KINETIC), delta = energy - height;
    const q = Math.sqrt(Math.abs(delta) / ELECTRON_KINETIC), z = q * width;
    let endpoint, atZero, inside;
    if (z < 1e-7) {
      endpoint = complexDivide(1, 0, 1, -k * width / 2);
      inside = x => complexMultiply(endpoint, { re: 1, im: k * (x - width) });
    } else if (delta >= 0) {
      endpoint = complexDivide(1, 0, Math.cos(z), -(k * k + q * q) / (2 * k * q) * Math.sin(z));
      inside = x => complexMultiply(endpoint, { re: Math.cos(q * (x - width)), im: k / q * Math.sin(q * (x - width)) });
    } else {
      const e2 = Math.exp(-2 * z);
      const dr = (1 + e2) / 2, di = -(k * k - q * q) / (2 * k * q) * (1 - e2) / 2;
      endpoint = complexDivide(Math.exp(-z), 0, dr, di);
      inside = x => {
        const p = Math.exp(-q * x), m = Math.exp(-q * (2 * width - x));
        return complexDivide((p + m) / 2, -k / q * (p - m) / 2, dr, di);
      };
    }
    atZero = inside(0);
    const reflected = { re: atZero.re - 1, im: atZero.im };
    const wave = x => {
      finite(x, 'position');
      if (x < 0) { const incident = { re: Math.cos(k * x), im: Math.sin(k * x) }; const back = complexMultiply(reflected, { re: Math.cos(k * x), im: -Math.sin(k * x) }); return { re: incident.re + back.re, im: incident.im + back.im }; }
      if (x <= width) return inside(x);
      return complexMultiply(endpoint, { re: Math.cos(k * (x - width)), im: Math.sin(k * (x - width)) });
    };
    return { k, q, transmission: barrierTransmission(energy, height, width), reflected, endpoint, wave };
  }
  function normalDensity(x, sigma) { positive(sigma, 'spread'); return Math.exp(-.5 * (x / sigma) ** 2) / (Math.sqrt(TAU) * sigma); }
  function gaussianPacket(sigmaNm, timeFs) {
    positive(sigmaNm, 'initial position spread'); nonnegative(timeFs, 'time');
    const tau = CONSTANTS.hbar * timeFs * 1e-15 / (2 * CONSTANTS.electronMass * (sigmaNm * 1e-9) ** 2);
    const sigmaX = sigmaNm * Math.sqrt(1 + tau * tau), sigmaP = 1 / (2 * sigmaNm);
    return { sigmaX, sigmaP, tau, productHbar: sigmaX * sigmaP, covarianceHbar: tau / 2, positionDensity: x => normalDensity(x, sigmaX), momentumDensity: p => normalDensity(p, sigmaP), realWave: x => Math.sqrt(normalDensity(x, sigmaX)) * Math.cos(-Math.atan(tau) / 2 + x * x * tau / (4 * sigmaNm * sigmaNm * (1 + tau * tau))) };
  }
  function membraneShape(x, y, m, n, angle) {
    if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < 1) throw new RangeError('mode numbers must be positive integers');
    finite(x, 'x'); finite(y, 'y'); finite(angle, 'blend angle');
    return Math.cos(angle) * Math.sin(m * PI * x) * Math.sin(n * PI * y) + Math.sin(angle) * Math.sin(n * PI * x) * Math.sin(m * PI * y);
  }
  function membraneFrequency(m, n, length, waveSpeed) { positive(length, 'membrane side'); positive(waveSpeed, 'wave speed'); if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < 1) throw new RangeError('mode numbers must be positive integers'); return waveSpeed / (2 * length) * Math.hypot(m, n); }

  const GRAY_SCOTT_PRESETS = Object.freeze({ spots: Object.freeze({ label: 'Spots', feed: .035, kill: .065 }), stripes: Object.freeze({ label: 'Stripes', feed: .03, kill: .058 }), coral: Object.freeze({ label: 'Coral', feed: .0545, kill: .062 }) });
  function grayScottState(size, preset, seed) {
    if (!Number.isInteger(size) || size < 16 || size > 256) throw new RangeError('grid size must be an integer from 16 to 256');
    const params = typeof preset === 'string' ? GRAY_SCOTT_PRESETS[preset] : preset;
    if (!params) throw new RangeError('unknown Gray–Scott preset');
    const rng = seededRandom(seed === undefined ? 137 : seed), count = size * size;
    const state = { size, u: new Float64Array(count).fill(1), v: new Float64Array(count), nextU: new Float64Array(count), nextV: new Float64Array(count), feed: params.feed, kill: params.kill, du: .16, dv: .08, time: 0, steps: 0 };
    for (let cy = .13; cy < .96; cy += .21) for (let cx = .13; cx < .96; cx += .21) {
      const px = Math.round((cx + (rng() - .5) * .1) * size), py = Math.round((cy + (rng() - .5) * .1) * size), radius = Math.max(2, size * (.025 + rng() * .017));
      for (let y = Math.floor(py - radius); y <= Math.ceil(py + radius); y++) for (let x = Math.floor(px - radius); x <= Math.ceil(px + radius); x++) {
        if (Math.hypot(x - px, y - py) > radius) continue;
        const idx = ((y + size) % size) * size + (x + size) % size;
        state.u[idx] = .5 + (rng() - .5) * .03; state.v[idx] = .25 + (rng() - .5) * .03;
      }
    }
    return state;
  }
  function grayScottStep(state, steps, requestedStep) {
    const dtMax = requestedStep === undefined ? .5 : positive(requestedStep, 'time step');
    if (dtMax > .5) throw new RangeError('time step must be at most 0.5');
    if (!Number.isInteger(steps) || steps < 0 || steps > 20000) throw new RangeError('step count must be an integer from 0 to 20000');
    for (const key of ['feed', 'kill']) { nonnegative(state[key], key); if (state[key] > .1) throw new RangeError(key + ' must be at most 0.1'); }
    for (const key of ['du', 'dv']) nonnegative(state[key], key);
    const n = state.size;
    if (!Number.isInteger(n) || n < 2 || state.u.length !== n * n || state.v.length !== n * n || state.nextU.length !== n * n || state.nextV.length !== n * n) throw new RangeError('invalid grid buffers');
    let maxV = 0;
    for (let i = 0; i < n * n; i++) { if (!Number.isFinite(state.u[i]) || !Number.isFinite(state.v[i]) || state.u[i] < 0 || state.u[i] > 1 + 1e-12 || state.v[i] < 0) throw new RangeError('concentrations must be finite: U in [0,1], V nonnegative'); maxV = Math.max(maxV, state.v[i]); }
    for (let step = 0; step < steps; step++) {
      // Nonnegative coefficients for both finite-difference updates. No clipping is needed.
      const dt = Math.min(dtMax, .9 / (4 * state.du + maxV * maxV + state.feed), .9 / (4 * state.dv + state.feed + state.kill));
      const u = state.u, v = state.v, nu = state.nextU, nv = state.nextV; let nextMaxV = 0;
      for (let y = 0; y < n; y++) {
        const row = y * n, up = ((y + n - 1) % n) * n, down = ((y + 1) % n) * n;
        for (let x = 0; x < n; x++) {
          const i = row + x, left = row + (x + n - 1) % n, right = row + (x + 1) % n, a = u[i], b = v[i], reaction = a * b * b;
          const lapU = u[left] + u[right] + u[up + x] + u[down + x] - 4 * a;
          const lapV = v[left] + v[right] + v[up + x] + v[down + x] - 4 * b;
          nu[i] = a + dt * (state.du * lapU - reaction + state.feed * (1 - a));
          nv[i] = b + dt * (state.dv * lapV + reaction - (state.feed + state.kill) * b);
          nextMaxV = Math.max(nextMaxV, nv[i]);
        }
      }
      state.u = nu; state.v = nv; state.nextU = u; state.nextV = v; state.time += dt; state.steps++; maxV = nextMaxV;
    }
    return state;
  }
  function grayScottBrush(state, x, y, radius, concentration) {
    finite(x, 'brush x'); finite(y, 'brush y'); positive(radius, 'brush radius');
    const amount = concentration === undefined ? .5 : finite(concentration, 'brush concentration');
    if (x < 0 || x > 1 || y < 0 || y > 1 || amount < 0 || amount > 1 || radius > state.size / 2) throw new RangeError('brush is outside the model domain');
    const n = state.size, cx = Math.round(x * n), cy = Math.round(y * n);
    for (let py = Math.floor(cy - radius); py <= Math.ceil(cy + radius); py++) for (let px = Math.floor(cx - radius); px <= Math.ceil(cx + radius); px++) {
      if (Math.hypot(px - cx, py - cy) > radius) continue;
      const i = ((py + n) % n) * n + (px + n) % n; state.u[i] = 1 - amount; state.v[i] = amount;
    }
    return state;
  }

  let mountCount = 0;
  function createViewer(container, mode) {
    const doc = container.ownerDocument;
    const meta = MODES[mode], uid = 'ph-' + (++mountCount);
    const root = doc.createElement('section'); root.className = 'ph-root'; root.dataset.mode = mode;
    const make = (tag, cls, text, parent) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; if (parent) parent.appendChild(el); return el; };
    const header = make('header', 'ph-header', undefined, root);
    make('p', 'ph-kicker', meta.kicker, header); make('h2', '', meta.title, header); make('p', 'ph-intro', meta.intro, header);
    const presets = make('div', 'ph-presets', undefined, root);
    const stage = make('div', 'ph-stage', undefined, root);
    const canvas = make('canvas', 'ph-canvas', undefined, stage); canvas.tabIndex = 0; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', meta.title + '. ' + meta.caption); canvas.textContent = meta.intro;
    const desc = make('p', 'ph-sr', 'The numerical readouts and model notes below provide a text alternative. Move a pointer or tap the visual to inspect. While the visual is focused, use the arrow keys to move an inspection point, and Escape to clear it.', root); desc.id = uid + '-description'; canvas.setAttribute('aria-describedby', desc.id);
    const probe = make('p', 'ph-probe', 'Move or tap to explore · arrow keys work when the visual is focused', stage);
    const caption = make('p', 'ph-caption', meta.caption, root);
    const controls = make('div', 'ph-controls', undefined, root);
    const transport = make('div', 'ph-transport', undefined, controls);
    const ranges = make('div', 'ph-ranges', undefined, controls);
    const readoutHost = make('dl', 'ph-readouts', undefined, root);
    const equation = make('p', 'ph-equation', '', root);
    const details = make('details', 'ph-notes', undefined, root); make('summary', '', 'The model & its limits', details); make('p', '', meta.notes, details);
    const sources = make('ul', '', undefined, details);
    for (const key of meta.sources) { const li = make('li', '', undefined, sources); const a = make('a', '', SOURCES[key].title, li); a.href = SOURCES[key].url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    const announcer = make('p', 'ph-sr', '', root); announcer.setAttribute('role', 'status'); announcer.setAttribute('aria-live', 'polite');
    container.replaceChildren(root);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This lab needs a browser with Canvas 2D support.');
    const listeners = [], disposers = [];
    const on = (el, event, fn, opts) => { el.addEventListener(event, fn, opts); listeners.push(() => el.removeEventListener(event, fn, opts)); };
    const v = { root, doc, make, canvas, ctx, presets, controls, transport, ranges, equation, width: 1, height: 1, playing: false, draw: () => {}, tick: () => {}, hit: null, pointer: null, on, cleanupExtras: disposers, announce: text => { announcer.textContent = text; } };
    let stopped = false, raf = 0, previous = null, inFrame = false;
    const motion = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    v.reducedMotion = !!(motion && motion.matches);
    const frame = now => {
      raf = 0; if (stopped) return; inFrame = true;
      const dt = previous === null ? 0 : Math.min(.06, (now - previous) / 1000); previous = now;
      if (v.playing) v.tick(dt);
      ctx.setTransform(canvas.width / v.width, 0, 0, canvas.height / v.height, 0, 0);
      v.draw(ctx, v.width, v.height);
      if (v.pointer) { ctx.save(); ctx.strokeStyle = '#f3eadf70'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(v.pointer.x * v.width, v.pointer.y * v.height, 7, 0, TAU); ctx.stroke(); ctx.restore(); }
      inFrame = false;
      if (v.playing) raf = global.requestAnimationFrame(frame);
    };
    v.redraw = () => { if (!stopped && !raf && !inFrame) { previous = null; raf = global.requestAnimationFrame(frame); } };
    let playButton = null, playNames = ['Play', 'Pause'];
    v.setPlaying = playing => { v.playing = !!playing; if (playButton) { playButton.textContent = playing ? playNames[1] : playNames[0]; playButton.setAttribute('aria-pressed', String(!!playing)); } v.redraw(); };
    v.button = (text, action, parent, tooltip) => { const b = make('button', 'ph-button', text, parent || transport); b.type = 'button'; if (tooltip) { b.title = tooltip; b.setAttribute('aria-label', text + ': ' + tooltip); } on(b, 'click', action); return b; };
    v.playControl = (start, names) => { playNames = names || ['Play', 'Pause']; playButton = v.button(playNames[0], () => { if (!v.playing && start) start(); v.setPlaying(!v.playing); }); playButton.setAttribute('aria-pressed', 'false'); return playButton; };
    v.help = (parent, text) => {
      const wrap = make('span', 'ph-help-wrap', undefined, parent), b = make('button', 'ph-help', '?', wrap), tip = make('span', 'ph-tooltip', text, wrap);
      b.type = 'button'; b.setAttribute('aria-label', 'Explain this control'); tip.id = uid + '-tip-' + listeners.length; tip.setAttribute('role', 'tooltip'); b.setAttribute('aria-describedby', tip.id); b.setAttribute('aria-expanded', 'false'); tip.hidden = true;
      let pinned = false;
      const show = flag => { tip.hidden = !flag; b.setAttribute('aria-expanded', String(flag)); };
      on(wrap, 'pointerenter', () => show(true)); on(wrap, 'pointerleave', () => { if (!pinned && doc.activeElement !== b) show(false); }); on(b, 'focus', () => show(true)); on(b, 'blur', () => { pinned = false; show(false); }); on(b, 'click', () => { pinned = !pinned; show(pinned); }); on(b, 'keydown', e => { if (e.key === 'Escape') { pinned = false; show(false); } });
      return b;
    };
    v.range = (label, min, max, step, value, format, change, help, parent) => {
      const group = make('div', 'ph-range', undefined, parent || ranges), row = make('div', 'ph-range-label', undefined, group), lab = make('label', '', label, row), out = make('output', '', format(value), row), input = make('input', '', undefined, group);
      input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = value; input.id = uid + '-range-' + listeners.length; lab.htmlFor = input.id; out.htmlFor = input.id; if (help) v.help(row, help);
      const set = next => { input.value = String(next); out.textContent = format(Number(input.value)); input.setAttribute('aria-valuetext', out.textContent); };
      on(input, 'input', () => { const next = Number(input.value); set(next); change(next); v.redraw(); }); set(value);
      return { input, output: out, set, group };
    };
    v.readouts = labels => labels.map(label => { const item = make('div', '', undefined, readoutHost); make('dt', '', label, item); const val = make('dd', '', '—', item); return value => { if (val.textContent !== value) val.textContent = value; }; });
    v.select = (label, options, value, change) => { const wrap = make('label', 'ph-select', undefined, ranges); make('span', '', label, wrap); const select = make('select', '', undefined, wrap); for (const item of options) { const opt = make('option', '', item.label, select); opt.value = item.value; } select.value = value; on(select, 'change', () => { change(select.value); v.redraw(); }); return select; };
    const inspect = (nx, ny, announce) => {
      v.pointer = { x: clamp(nx, .03, .97), y: clamp(ny, .04, .89) };
      if (v.hit) { const text = v.hit(v.pointer.x * v.width, v.pointer.y * v.height, v.width, v.height); if (text) { probe.textContent = text; if (announce) v.announce(text); } }
      v.redraw();
    };
    on(canvas, 'pointermove', e => { if (e.pointerType === 'touch') return; const box = canvas.getBoundingClientRect(); inspect((e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height, false); });
    on(canvas, 'pointerdown', e => { const box = canvas.getBoundingClientRect(); inspect((e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height, true); });
    on(canvas, 'pointerleave', () => { v.pointer = null; v.redraw(); });
    on(canvas, 'keydown', e => { if (e.key === 'Escape') { v.pointer = null; probe.textContent = 'Move or tap to explore · arrow keys work when the visual is focused'; v.redraw(); return; } const p = v.pointer || { x: .5, y: .5 }; const directions = { ArrowLeft: [-.025, 0], ArrowRight: [.025, 0], ArrowUp: [0, -.025], ArrowDown: [0, .025] }; if (directions[e.key]) { e.preventDefault(); const d = directions[e.key]; inspect(p.x + d[0], p.y + d[1], true); } });
    on(canvas, 'focus', () => inspect(.5, .5, true));
    const resize = () => { const rect = canvas.getBoundingClientRect(); v.width = Math.max(280, rect.width || container.clientWidth || 640); v.height = Math.max(300, rect.height || 480); const dpr = Math.min(2, global.devicePixelRatio || 1); canvas.width = Math.round(v.width * dpr); canvas.height = Math.round(v.height * dpr); v.redraw(); };
    if (global.ResizeObserver) { const observer = new global.ResizeObserver(resize); observer.observe(stage); disposers.push(() => observer.disconnect()); } else on(global, 'resize', resize);
    if (motion && motion.addEventListener) on(motion, 'change', e => { v.reducedMotion = e.matches; if (e.matches) v.setPlaying(false); });
    v.dispose = () => { stopped = true; v.playing = false; if (raf) global.cancelAnimationFrame(raf); listeners.forEach(off => off()); disposers.forEach(fn => fn()); root.remove(); };
    resize();
    return v;
  }
  function backdrop(ctx, w, h, tinted) {
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * .5, h * .42, 0, w * .5, h * .42, Math.max(w, h) * .65); glow.addColorStop(0, tinted || '#252535'); glow.addColorStop(1, C.bg); ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  }
  function label(ctx, text, x, y, color, size, align) { ctx.fillStyle = color || C.muted; ctx.font = (size || 12) + 'px ui-sans-serif, system-ui, sans-serif'; ctx.textAlign = align || 'left'; ctx.fillText(text, x, y); }
  function line(ctx, x1, y1, x2, y2, color, width) { ctx.strokeStyle = color; ctx.lineWidth = width || 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function circle(ctx, x, y, radius, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill(); }
  function curve(ctx, points, color, width) { ctx.strokeStyle = color; ctx.lineWidth = width || 1.5; ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }
  function roundPercent(x) { return x < .00001 ? '<0.001%' : (x * 100).toFixed(x < .01 ? 3 : 1) + '%'; }

  function blackHoleView(v) {
    let b = 2.75, progress = 1, selected = traceSchwarzschild(b), beam = true;
    const companions = [-5.8, -4.4, -3.25, -2.72, -2.45, -1.5, 1.5, 2.45, 3.25, 4.4, 5.8].map(x => traceSchwarzschild(x));
    const read = v.readouts(['Selected path', 'Closest approach', 'Deflection']);
    const update = () => {
      selected = traceSchwarzschild(b);
      const names = { captured: 'Horizon crossing', escaped: 'Escapes', critical: 'Critical approach', unresolved: 'Trace limit' };
      read[0](names[selected.outcome]); read[1](selected.closestRadius.toFixed(3) + ' rₛ'); read[2](selected.deflection === null ? '—' : (selected.deflection * 180 / PI).toFixed(1) + '°');
      v.equation.textContent = 'Capture threshold  b = 2.598076… rₛ   ·   photon sphere  r = 1.5 rₛ';
      v.redraw();
    };
    const setPreset = next => { b = next; impact.set(next); progress = 1; scrub.set(100); v.setPlaying(false); update(); };
    [['Wide escape', 5.4], ['A long way round', 2.61], ['The threshold', CONSTANTS.criticalImpact], ['Captured', 2.3]].forEach(([name, value]) => v.button(name, () => setPreset(value), v.presets));
    v.playControl(() => { if (progress >= 1) { progress = 0; scrub.set(0); } }, ['Trace light', 'Pause trace']);
    v.button('Reset', () => { beam = true; beamButton.setAttribute('aria-pressed', 'true'); setPreset(2.75); });
    const beamButton = v.button('Show beam', () => { beam = !beam; beamButton.setAttribute('aria-pressed', String(beam)); v.redraw(); }); beamButton.setAttribute('aria-pressed', 'true');
    const impact = v.range('Aim · impact parameter', 1, 6, .001, b, x => x.toFixed(3) + ' rₛ', x => { b = x; update(); }, 'The miss distance the incoming ray would have in flat space. This is not its actual closest distance to the black hole. rₛ is the Schwarzschild radius.');
    const scrub = v.range('Trace progress', 0, 100, .1, 100, x => Math.round(x) + '%', x => { progress = x / 100; v.setPlaying(false); }, 'Reveal the selected path. Animation progress is a drawing parameter, not elapsed physical time.');
    v.tick = dt => { progress = Math.min(1, progress + dt / 8); scrub.set(progress * 100); if (progress === 1) v.setPlaying(false); };
    function geometry(w, h) { return { x: w * .51, y: h * .46, scale: Math.min(w / 17, h / 13.5) }; }
    v.draw = (ctx, w, h) => {
      backdrop(ctx, w, h, '#202431');
      const g = geometry(w, h);
      const rng = seededRandom(331);
      for (let i = 0; i < 80; i++) { const x = rng() * w, y = rng() * (h - 45); circle(ctx, x, y, rng() < .1 ? 1 : .55, '#aab4c32d'); }
      ctx.save(); ctx.translate(g.x, g.y);
      [3, 5, 7].forEach(r => { ctx.strokeStyle = '#a7a5b00e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, g.scale * r, 0, TAU); ctx.stroke(); });
      ctx.restore();
      const plot = (ray, bright, fraction) => {
        const pts = ray.points.filter(p => Math.abs(p.x * g.scale) < w * .72 && Math.abs(p.y * g.scale) < h * .65);
        const length = Math.max(2, Math.round(pts.length * fraction));
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h - 41); ctx.clip();
        if (bright) { ctx.shadowColor = C.copper; ctx.shadowBlur = 12; }
        curve(ctx, pts.slice(0, length).map(p => [g.x + p.x * g.scale, g.y - p.y * g.scale]), bright ? C.copper : ray.outcome === 'captured' ? '#b791b54b' : '#91b9d766', bright ? 2.4 : 1);
        if (bright && fraction < 1 && pts.length) { const p = pts[Math.min(pts.length - 1, length - 1)]; circle(ctx, g.x + p.x * g.scale, g.y - p.y * g.scale, 3, C.text); }
        ctx.restore();
      };
      if (beam) companions.forEach(ray => plot(ray, false, 1));
      plot(selected, true, progress);
      const halo = ctx.createRadialGradient(g.x, g.y, g.scale * .8, g.x, g.y, g.scale * 2.15); halo.addColorStop(0, '#ad937c15'); halo.addColorStop(.5, '#ad937c11'); halo.addColorStop(1, '#ad937c00'); circle(ctx, g.x, g.y, g.scale * 2.15, halo);
      ctx.strokeStyle = '#c3b0f08c'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.arc(g.x, g.y, g.scale * 1.5, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      circle(ctx, g.x, g.y, g.scale, '#080a10'); ctx.strokeStyle = '#e7dcd066'; ctx.beginPath(); ctx.arc(g.x, g.y, g.scale, 0, TAU); ctx.stroke();
      label(ctx, 'rₛ', g.x, g.y + 4, '#b4abb7', 12, 'center');
      label(ctx, 'INCOMING LIGHT', 22, 28, C.muted, 10); label(ctx, 'SCHWARZSCHILD PATH MAP', w - 22, 28, C.muted, w < 440 ? 9 : 10, 'right');
      line(ctx, 25, h - 65, 25 + g.scale * 2, h - 65, C.muted, 1); line(ctx, 25, h - 69, 25, h - 61, C.muted); line(ctx, 25 + g.scale * 2, h - 69, 25 + g.scale * 2, h - 61, C.muted); label(ctx, '2 rₛ', 25 + g.scale, h - 75, C.muted, 11, 'center');
      label(ctx, 'Horizon', w - 25, h - 78, C.text, 11, 'right'); label(ctx, 'Photon sphere · dashed', w - 25, h - 60, C.lavender, 11, 'right');
    };
    v.hit = (x, y, w, h) => { const g = geometry(w, h); const r = Math.hypot((x - g.x) / g.scale, (y - g.y) / g.scale); if (r < 1) return 'Inside rₛ: future-directed light cannot escape. This exterior path map stops at the horizon.'; if (Math.abs(r - 1.5) < .3) return 'Photon sphere · r = 1.5 rₛ. A circular light orbit is possible here but unstable.'; return 'Areal radius ' + r.toFixed(2) + ' rₛ · the selected incoming ray has b = ' + b.toFixed(4) + ' rₛ.'; };
    update();
  }

  function doubleSlitView(v) {
    let wavelength = 550, separation = 180, distinguishable = false, count = 1200, fraction = 0;
    let distribution, events = [];
    const windowHalf = .012, maxEvents = 12000;
    const read = v.readouts(['Detections shown', 'Fringe spacing', 'Path record']);
    const config = () => ({ wavelength: wavelength * 1e-9, slitWidth: 35e-6, separation: separation * 1e-6, distance: 1, coherence: distinguishable ? 0 : 1 });
    const updateReadout = () => { read[0](Math.floor(count).toLocaleString('en')); read[1]((wavelength / separation).toFixed(2) + ' mm'); read[2](distinguishable ? 'Distinguishable' : 'Coherent'); v.equation.textContent = distinguishable ? 'Which-path record → add probabilities → no interference cross term' : 'Indistinguishable paths → add amplitudes → fringes build from individual events'; };
    const rebuild = () => { distribution = detectorDistribution(config(), windowHalf, 1600); const rng = seededRandom(72351); events = Array.from({ length: maxEvents }, () => ({ position: sampleDetector(distribution, rng()), vertical: rng(), alpha: .3 + .65 * rng() })); updateReadout(); v.redraw(); };
    const choose = detected => { distinguishable = detected; coherent.setAttribute('aria-pressed', String(!detected)); recorded.setAttribute('aria-pressed', String(detected)); rebuild(); };
    const coherent = v.button('Paths indistinguishable', () => choose(false), v.presets);
    const recorded = v.button('Record which path', () => choose(true), v.presets);
    coherent.setAttribute('aria-pressed', 'true'); recorded.setAttribute('aria-pressed', 'false');
    v.playControl(() => { if (count >= maxEvents) count = 0; }, ['Send detections', 'Pause detections']);
    v.button('+ 1 detection', () => { count = Math.min(maxEvents, Math.floor(count) + 1); timeline.set(count); updateReadout(); v.redraw(); });
    v.button('Clear', () => { count = 0; fraction = 0; v.setPlaying(false); timeline.set(0); updateReadout(); });
    v.range('Wavelength', 400, 700, 5, wavelength, x => x.toFixed(0) + ' nm', x => { wavelength = x; rebuild(); }, 'Longer wavelengths spread the fringes farther apart. The source is ideal monochromatic light; slit width is fixed at 35 µm.');
    v.range('Slit separation', 90, 300, 5, separation, x => x.toFixed(0) + ' µm', x => { separation = x; rebuild(); }, 'Centre-to-centre slit separation. The detector is 1 metre away; the paraxial far-field approximation is used.');
    const timeline = v.range('Accumulated events', 0, maxEvents, 1, count, x => Math.round(x).toLocaleString('en'), x => { count = x; v.setPlaying(false); updateReadout(); }, 'Scrub through a reproducible sequence of independent samples from the probability distribution. Changing the setup regenerates that sequence for the new distribution.');
    v.tick = dt => { fraction += dt * 450; const n = Math.floor(fraction); fraction -= n; count = Math.min(maxEvents, count + n); timeline.set(count); updateReadout(); if (count >= maxEvents) v.setPlaying(false); };
    function layout(w, h) { return { left: 28, width: w - 56, curveBase: h * .48, curveHeight: h * .28, plateTop: h * .55, plateHeight: h * .26 }; }
    v.draw = (ctx, w, h) => {
      backdrop(ctx, w, h, distinguishable ? '#27232c' : '#222635');
      const g = layout(w, h), xOf = y => g.left + (y / (windowHalf * 2) + .5) * g.width;
      label(ctx, 'DETECTOR / 1 METRE FROM SLITS', g.left, 29, C.muted, w < 430 ? 9 : 10);
      label(ctx, distinguishable ? 'PATH RECORD ON' : 'COHERENT', w - 28, 29, distinguishable ? C.copper : C.lavender, w < 430 ? 9 : 10, 'right');
      const maxDensity = 420;
      const pts = distribution.density.map((d, i) => [g.left + (i + .5) / distribution.bins * g.width, g.curveBase - d / maxDensity * g.curveHeight]);
      ctx.beginPath(); ctx.moveTo(g.left, g.curveBase); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(g.left + g.width, g.curveBase); ctx.closePath();
      const glow = ctx.createLinearGradient(0, g.curveBase - g.curveHeight, 0, g.curveBase); glow.addColorStop(0, distinguishable ? '#e2a47d80' : '#c3b0f080'); glow.addColorStop(1, '#b0afe500'); ctx.fillStyle = glow; ctx.fill();
      curve(ctx, pts, distinguishable ? C.copper : C.lavender, 1.9);
      line(ctx, g.left, g.curveBase, g.left + g.width, g.curveBase, '#aba7bb33');
      label(ctx, 'Probability density', g.left, g.curveBase + 20, C.muted, 11);
      ctx.fillStyle = '#0b0d16'; ctx.fillRect(g.left, g.plateTop, g.width, g.plateHeight);
      ctx.strokeStyle = '#b9b5c224'; ctx.strokeRect(g.left, g.plateTop, g.width, g.plateHeight);
      ctx.save(); ctx.beginPath(); ctx.rect(g.left, g.plateTop, g.width, g.plateHeight); ctx.clip();
      for (let i = 0; i < Math.floor(count); i++) { const e = events[i]; ctx.globalAlpha = e.alpha; ctx.fillStyle = distinguishable ? '#eac3a6' : '#d8d0f0'; ctx.fillRect(xOf(e.position), g.plateTop + e.vertical * g.plateHeight, 1.2, 1.2); }
      ctx.restore();
      for (const pos of [-10, -5, 0, 5, 10]) { const x = xOf(pos / 1000); line(ctx, x, g.plateTop + g.plateHeight + 3, x, g.plateTop + g.plateHeight + 8, '#b9b5c250'); label(ctx, (pos > 0 ? '+' : '') + pos, x, g.plateTop + g.plateHeight + 24, C.muted, 11, 'center'); }
      label(ctx, 'detector position / mm', w / 2, h - 43, C.muted, 10, 'center');
      if (count === 0) label(ctx, 'An empty detector. Send a few arrivals.', w / 2, g.plateTop + g.plateHeight * .55, C.muted, 12, 'center');
    };
    v.hit = (x, y, w, h) => { const g = layout(w, h); const mm = ((x - g.left) / g.width - .5) * 24; const bin = clamp(Math.floor((mm / 24 + .5) * distribution.bins), 0, distribution.bins - 1); return mm.toFixed(2) + ' mm · probability density ' + (distribution.density[bin] / 1000).toFixed(4) + ' per mm · ' + (distinguishable ? 'no cross-path interference' : 'coherent two-slit interference'); };
    rebuild();
  }

  function tunnellingView(v) {
    let energy = 1.5, height = 2, width = .45, phase = 0, state, showDensity = false;
    const read = v.readouts(['Transmission', 'Reflection', 'Energy regime']);
    const update = () => { state = stationaryBarrier(energy, height, width); read[0](roundPercent(state.transmission)); read[1](roundPercent(1 - state.transmission)); read[2](Math.abs(energy - height) < 1e-8 ? 'At the barrier' : energy < height ? 'Below barrier' : 'Above barrier'); v.equation.textContent = 'T + R = 1   ·   E = ' + energy.toFixed(2) + ' eV   ·   V₀ = ' + height.toFixed(2) + ' eV   ·   a = ' + width.toFixed(2) + ' nm'; v.redraw(); };
    const preset = (e, v0, a) => { energy = e; height = v0; width = a; phase = 0; er.set(e); vr.set(v0); wr.set(a); pr.set(0); v.setPlaying(false); update(); };
    v.button('Below the barrier', () => preset(1.5, 2, .45), v.presets);
    v.button('At the threshold', () => preset(2, 2, .45), v.presets);
    v.button('A resonance', () => preset(2 + ELECTRON_KINETIC * (PI / .45) ** 2, 2, .45), v.presets);
    v.playControl(null, ['Animate phase', 'Pause phase']);
    v.button('Reset', () => preset(1.5, 2, .45));
    const density = v.button('Probability density', () => { showDensity = !showDensity; density.setAttribute('aria-pressed', String(showDensity)); v.redraw(); }); density.setAttribute('aria-pressed', 'false');
    const er = v.range('Electron energy', .1, 6, .01, energy, x => x.toFixed(2) + ' eV', x => { energy = x; update(); }, 'One stationary electron energy. It stays the same on both sides of the barrier.');
    const vr = v.range('Barrier height', .1, 5, .01, height, x => x.toFixed(2) + ' eV', x => { height = x; update(); }, 'Potential energy in the barrier region. Above-barrier reflection is still possible because wave amplitudes interfere.');
    const wr = v.range('Barrier width', .05, 1.2, .01, width, x => x.toFixed(2) + ' nm', x => { width = x; update(); }, 'The physical width of the rectangular potential barrier. Wider barriers usually suppress below-barrier transmission strongly.');
    const pr = v.range('Wave phase', 0, 360, 1, 0, x => Math.round(x) + '°', x => { phase = x / 180 * PI; v.setPlaying(false); }, 'A global phase of the stationary wavefunction. Its real part changes, but probability density and the transmission probability remain fixed. Playback is slowed for visibility.');
    v.tick = dt => { phase = (phase + dt * TAU * .25) % TAU; pr.set(phase * 180 / PI); };
    function layout(w, h) { return { left: 28, right: w - 28, xmin: -1.35, xmax: 2.25, potentialBase: h * .33, energyScale: h * .038, waveBase: h * .68, waveScale: h * .078 }; }
    v.draw = (ctx, w, h) => {
      backdrop(ctx, w, h, '#252330'); const g = layout(w, h), xOf = x => g.left + (x - g.xmin) / (g.xmax - g.xmin) * (g.right - g.left), x0 = xOf(0), xa = xOf(width);
      label(ctx, 'ENERGY PROFILE', g.left, 27, C.muted, 10); label(ctx, 'ELECTRON / 1D BARRIER', g.right, 27, C.muted, w < 430 ? 9 : 10, 'right');
      ctx.fillStyle = '#a995dc14'; ctx.fillRect(x0, 49, xa - x0, h * .81 - 49);
      ctx.setLineDash([3, 5]); line(ctx, x0, 49, x0, h * .81, '#c3b0f03a'); line(ctx, xa, 49, xa, h * .81, '#c3b0f03a'); ctx.setLineDash([]);
      const barrierTop = g.potentialBase - height * g.energyScale;
      ctx.fillStyle = '#b6a1db25'; ctx.fillRect(x0, barrierTop, xa - x0, g.potentialBase - barrierTop);
      curve(ctx, [[g.left, g.potentialBase], [x0, g.potentialBase], [x0, barrierTop], [xa, barrierTop], [xa, g.potentialBase], [g.right, g.potentialBase]], C.lavender, 1.5);
      const eY = g.potentialBase - energy * g.energyScale;
      ctx.setLineDash([6, 4]); line(ctx, g.left, eY, g.right, eY, C.copper, 1); ctx.setLineDash([]);
      label(ctx, 'E ' + energy.toFixed(2), g.left + 3, eY - 7, C.copper, 11);
      label(ctx, 'V₀ ' + height.toFixed(2), xa + 8, barrierTop + 4, C.lavender, 11);
      label(ctx, 'Energy / eV', g.left, g.potentialBase + 22, C.muted, 10);
      const pts = [], top = [], bottom = [];
      const total = Math.ceil(w * 1.5);
      for (let i = 0; i <= total; i++) {
        const x = g.xmin + (g.xmax - g.xmin) * i / total, z = state.wave(x), probability = z.re * z.re + z.im * z.im;
        const value = showDensity ? probability : z.re * Math.cos(phase) + z.im * Math.sin(phase);
        pts.push([xOf(x), g.waveBase - value * g.waveScale]); const amplitude = Math.sqrt(probability); top.push([xOf(x), g.waveBase - amplitude * g.waveScale]); bottom.push([xOf(x), g.waveBase + amplitude * g.waveScale]);
      }
      if (!showDensity) { ctx.beginPath(); top.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); bottom.slice().reverse().forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = '#d4b6ba0b'; ctx.fill(); curve(ctx, top, '#d4b6ba45', 1); curve(ctx, bottom, '#d4b6ba45', 1); }
      line(ctx, g.left, g.waveBase, g.right, g.waveBase, '#b9b5c240');
      ctx.save(); ctx.shadowColor = C.copper; ctx.shadowBlur = 9; curve(ctx, pts, showDensity ? C.lavender : C.copper, 2); ctx.restore();
      label(ctx, showDensity ? '|ψ|² · relative to the incident density' : 'Re ψ · incident amplitude = 1', g.left, h * .45, C.muted, 11);
      label(ctx, 'incoming + reflected', g.left, h * .88, C.muted, 10); label(ctx, 'transmitted', g.right, h * .88, C.muted, 10, 'right');
      label(ctx, '0', x0, h * .85, C.lavender, 10, 'center'); label(ctx, width.toFixed(2) + ' nm', xa, h * .85, C.lavender, 10, 'center');
    };
    v.hit = (x, y, w, h) => { const g = layout(w, h); const nm = g.xmin + (x - g.left) / (g.right - g.left) * (g.xmax - g.xmin), z = state.wave(nm); return 'x = ' + nm.toFixed(3) + ' nm · |ψ|² = ' + (z.re * z.re + z.im * z.im).toFixed(3) + ' × incident density · ' + (nm < 0 ? 'incident and reflected waves overlap' : nm > width ? 'transmitted wave' : energy < height ? 'evanescent barrier region' : 'inside barrier'); };
    update();
  }

  function uncertaintyView(v) {
    let sigma = .7, time = 0, packet = gaussianPacket(sigma, time);
    const read = v.readouts(['Position spread · σₓ', 'Momentum spread · σₚ', 'Uncertainty product']);
    const update = () => { packet = gaussianPacket(sigma, time); read[0](packet.sigmaX.toFixed(3) + ' nm'); read[1](packet.sigmaP.toFixed(3) + ' ħ/nm'); read[2](packet.productHbar.toFixed(3) + ' ħ'); v.equation.textContent = time === 0 ? 'Prepared Gaussian: σₓσₚ = ħ/2' : 'Free evolution: σₚ stays fixed; σₓ grows · elapsed time ' + time.toFixed(2) + ' fs'; v.redraw(); };
    const preset = s => { sigma = s; time = 0; sr.set(sigma); tr.set(0); v.setPlaying(false); update(); };
    [['Pinpoint', .25], ['Balanced', .7], ['Spread out', 1.7]].forEach(([title, s]) => v.button(title, () => preset(s), v.presets));
    v.playControl(() => { if (time >= 10) { time = 0; tr.set(0); } }, ['Release packet', 'Pause time']);
    v.button('Re-prepare', () => { time = 0; tr.set(0); v.setPlaying(false); update(); });
    const sr = v.range('Initial position spread', .2, 2, .01, sigma, x => x.toFixed(2) + ' nm', x => { sigma = x; time = 0; tr.set(0); v.setPlaying(false); update(); }, 'The standard deviation of the prepared position distribution. A new preparation also sets σₚ = ħ/(2σₓ), then resets the clock.');
    const tr = v.range('Time after release', 0, 10, .01, time, x => x.toFixed(2) + ' fs', x => { time = x; v.setPlaying(false); update(); }, 'A femtosecond is 10⁻¹⁵ seconds. This is the analytic free evolution of an electron, not a measurement of its position. Playback is vastly slowed.');
    v.tick = dt => { time = Math.min(10, time + dt); tr.set(time); update(); if (time >= 10) v.setPlaying(false); };
    function panels(w, h) {
      const narrow = w < 520;
      return narrow ? [{ x: 28, y: 57, w: w - 56, h: h * .32, extent: 9, scale: 2.2, kind: 'x' }, { x: 28, y: h * .51, w: w - 56, h: h * .31, extent: 7.5, scale: 2.2, kind: 'p' }] : [{ x: 30, y: 87, w: (w - 94) / 2, h: h * .53, extent: 9, scale: 2.2, kind: 'x' }, { x: w / 2 + 17, y: 87, w: (w - 94) / 2, h: h * .53, extent: 7.5, scale: 2.2, kind: 'p' }];
    }
    v.draw = (ctx, w, h) => {
      backdrop(ctx, w, h, '#242536'); label(ctx, 'ONE STATE / TWO DISTRIBUTIONS', 28, 28, C.muted, w < 430 ? 9 : 10); label(ctx, time.toFixed(2) + ' fs', w - 28, 28, C.text, 12, 'right');
      for (const p of panels(w, h)) {
        const position = p.kind === 'x', spread = position ? packet.sigmaX : packet.sigmaP, density = position ? packet.positionDensity : packet.momentumDensity, col = position ? C.copper : C.lavender;
        const baseline = p.y + p.h, xOf = value => p.x + (value / (2 * p.extent) + .5) * p.w, yOf = d => baseline - d / p.scale * p.h;
        label(ctx, position ? 'POSITION · nm' : 'MOMENTUM · ħ/nm', p.x, p.y - 17, col, 11);
        for (const d of [.5, 1, 1.5]) { line(ctx, p.x, yOf(d), p.x + p.w, yOf(d), '#bbb4cb10'); label(ctx, String(d), p.x + 3, yOf(d) - 4, '#8d899e', 9); }
        const pts = Array.from({ length: 401 }, (_, i) => { const value = (i / 400 - .5) * 2 * p.extent; return [xOf(value), yOf(density(value))]; });
        ctx.beginPath(); ctx.moveTo(p.x, baseline); pts.forEach(z => ctx.lineTo(z[0], z[1])); ctx.lineTo(p.x + p.w, baseline); ctx.closePath(); const grad = ctx.createLinearGradient(0, p.y, 0, baseline); grad.addColorStop(0, position ? '#e2a47d88' : '#c3b0f088'); grad.addColorStop(1, position ? '#e2a47d06' : '#c3b0f006'); ctx.fillStyle = grad; ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.rect(xOf(-spread), p.y - 1, xOf(spread) - xOf(-spread), p.h + 1); ctx.clip(); ctx.fillStyle = position ? '#e2a47d13' : '#c3b0f013'; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.restore();
        curve(ctx, pts, col, 2); line(ctx, p.x, baseline, p.x + p.w, baseline, '#bbb4cb44');
        const ticks = position ? [-8, -4, 0, 4, 8] : [-6, -3, 0, 3, 6]; ticks.forEach(value => { line(ctx, xOf(value), baseline, xOf(value), baseline + 5, '#bbb4cb50'); label(ctx, String(value), xOf(value), baseline + 18, C.muted, 10, 'center'); });
        const bracketY = baseline + 34; line(ctx, xOf(-spread), bracketY, xOf(spread), bracketY, col, 1.5); line(ctx, xOf(-spread), bracketY - 3, xOf(-spread), bracketY + 3, col); line(ctx, xOf(spread), bracketY - 3, xOf(spread), bracketY + 3, col);
        label(ctx, '±1σ', p.x + p.w / 2, bracketY + 16, col, 10, 'center');
      }
      if (w >= 520) { label(ctx, 'A tighter preparation needs a wider range of momenta.', w / 2, h * .83, C.muted, 12, 'center'); label(ctx, 'The momentum distribution stays fixed during free evolution.', w / 2, h * .88, C.muted, 11, 'center'); }
    };
    v.hit = (x, y, w, h) => { const ps = panels(w, h); const p = ps.reduce((best, a) => { const d = Math.hypot(x - (a.x + a.w / 2), y - (a.y + a.h / 2)); return !best || d < best.d ? { p: a, d } : best; }, null).p; const value = ((x - p.x) / p.w - .5) * 2 * p.extent; return p.kind === 'x' ? 'Position ' + value.toFixed(2) + ' nm · probability density ' + packet.positionDensity(value).toFixed(4) + ' per nm' : 'Momentum ' + value.toFixed(2) + ' ħ/nm · probability density ' + packet.momentumDensity(value).toFixed(4) + ' per (ħ/nm)'; };
    update();
  }

  function soundPatternsView(v) {
    let m = 3, n = 5, blend = -45, phase = 0, field = null, contours = [], listening = false, audioContext = null, oscillator = null, gain = null;
    const side = .4, waveSpeed = 80, resolution = 180;
    const imageCanvas = v.doc.createElement('canvas'); imageCanvas.width = resolution; imageCanvas.height = resolution;
    const imageContext = imageCanvas.getContext('2d'); const imageData = imageContext.createImageData(resolution, resolution);
    const read = v.readouts(['Mode pair', 'Frequency', 'Membrane']);
    const regenerate = () => {
      const angle = blend * PI / 180;
      field = new Float64Array((resolution + 1) * (resolution + 1)); contours = [];
      for (let y = 0; y <= resolution; y++) for (let x = 0; x <= resolution; x++) field[y * (resolution + 1) + x] = membraneShape(x / resolution, y / resolution, m, n, angle);
      // Marching-square zero contours; degenerate crossings are resolved at pixel scale.
      for (let y = 0; y < resolution; y++) for (let x = 0; x < resolution; x++) {
        const corners = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]], values = corners.map(p => field[p[1] * (resolution + 1) + p[0]]), hits = [];
        for (let j = 0; j < 4; j++) { const next = (j + 1) % 4; if ((values[j] < 0) !== (values[next] < 0)) { const t = values[j] / (values[j] - values[next]); hits.push([corners[j][0] + t * (corners[next][0] - corners[j][0]), corners[j][1] + t * (corners[next][1] - corners[j][1])]); } }
        if (hits.length === 2) contours.push(hits); else if (hits.length === 4) { contours.push([hits[0], hits[1]], [hits[2], hits[3]]); }
      }
      const hz = membraneFrequency(m, n, side, waveSpeed); read[0]('(' + m + ',' + n + ') + (' + n + ',' + m + ')'); read[1](hz.toFixed(1) + ' Hz'); read[2]('40 cm · fixed edges');
      v.equation.textContent = 'cos θ · sin(' + m + 'πx/L)sin(' + n + 'πy/L) + sin θ · sin(' + n + 'πx/L)sin(' + m + 'πy/L)';
      if (oscillator && audioContext) oscillator.frequency.setTargetAtTime(hz, audioContext.currentTime, .06);
      v.redraw();
    };
    const preset = (a, b, angle) => { m = a; n = b; blend = angle; modeSelect.value = a + ',' + b; br.set(angle); regenerate(); };
    [['Four petals', 1, 3, -45], ['Lattice', 3, 5, 0], ['Woven', 3, 5, -45], ['Intricate', 5, 7, 45]].forEach(([name, a, b, angle]) => v.button(name, () => preset(a, b, angle), v.presets));
    v.playControl(null, ['Vibrate', 'Pause vibration']);
    v.button('Reset phase', () => { phase = 0; pr.set(0); v.setPlaying(false); });
    const stopAudio = () => { listening = false; listenButton.textContent = 'Listen'; listenButton.setAttribute('aria-pressed', 'false'); if (gain && audioContext) gain.gain.setTargetAtTime(0, audioContext.currentTime, .03); };
    const listenButton = v.button('Listen', async () => {
      if (listening) { stopAudio(); return; }
      const AudioCtor = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtor) { v.announce('Audio is not supported in this browser. The frequency and visual pattern remain available.'); return; }
      try {
        if (!audioContext) { audioContext = new AudioCtor(); gain = audioContext.createGain(); gain.gain.value = 0; gain.connect(audioContext.destination); oscillator = audioContext.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = membraneFrequency(m, n, side, waveSpeed); oscillator.connect(gain); oscillator.start(); }
        await audioContext.resume(); listening = true; gain.gain.setTargetAtTime(.035, audioContext.currentTime, .08); listenButton.textContent = 'Mute'; listenButton.setAttribute('aria-pressed', 'true'); v.announce('Playing a quiet pure sine at ' + membraneFrequency(m, n, side, waveSpeed).toFixed(1) + ' hertz.');
      } catch (error) { v.announce('The browser blocked audio playback. You can still explore the visual mode.'); stopAudio(); }
    }); listenButton.setAttribute('aria-pressed', 'false');
    const modeSelect = v.select('Degenerate mode pair', ['1,2', '1,3', '2,3', '2,5', '3,4', '3,5', '4,7', '5,7', '6,7'].map(value => ({ value, label: '(' + value + ') and (' + value.split(',').reverse().join(',') + ')' })), '3,5', value => { [m, n] = value.split(',').map(Number); regenerate(); });
    const br = v.range('Blend angle', -90, 90, 1, blend, x => Math.round(x) + '°', x => { blend = x; regenerate(); }, 'The two same-frequency shapes mix with weights cos θ and sin θ. Negative weights reverse the relative phase. A zero-degree blend is a single mode.');
    const pr = v.range('Vibration phase', 0, 360, 1, 0, x => Math.round(x) + '°', x => { phase = x / 180 * PI; v.setPlaying(false); }, 'The membrane displacement is the chosen mode shape multiplied by cos of this phase. Nodal lines stay in place even as all displacement passes through zero.');
    v.tick = dt => { phase = (phase + TAU * .35 * dt) % TAU; pr.set(phase / PI * 180); };
    v.cleanupExtras.push(() => { listening = false; if (oscillator) { try { oscillator.stop(); } catch (_) {} oscillator.disconnect(); } if (gain) gain.disconnect(); if (audioContext) { const p = audioContext.close(); if (p && p.catch) p.catch(() => {}); } });
    function geometry(w, h) { const size = Math.min(w - 70, h - 120); return { size, x: (w - size) / 2, y: (h - 45 - size) / 2 }; }
    v.draw = (ctx, w, h) => {
      backdrop(ctx, w, h, '#252431'); const g = geometry(w, h), amplitude = Math.cos(phase);
      label(ctx, 'FIXED-EDGE SQUARE MEMBRANE', 24, 28, C.muted, w < 430 ? 9 : 10); label(ctx, 'NODES / DISPLACEMENT', w - 24, 28, C.muted, w < 430 ? 8 : 10, 'right');
      for (let y = 0; y < resolution; y++) for (let x = 0; x < resolution; x++) {
        const z = field[y * (resolution + 1) + x] * amplitude, a = clamp(Math.abs(z) / Math.SQRT2, 0, 1) ** .65, i = (y * resolution + x) * 4, rgb = z >= 0 ? [226, 164, 125] : [154, 150, 216];
        imageData.data[i] = 18 + (rgb[0] - 18) * a * .68; imageData.data[i + 1] = 19 + (rgb[1] - 19) * a * .68; imageData.data[i + 2] = 29 + (rgb[2] - 29) * a * .68; imageData.data[i + 3] = 255;
      }
      imageContext.putImageData(imageData, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(imageCanvas, g.x, g.y, g.size, g.size);
      ctx.save(); ctx.strokeStyle = '#e8d9f0'; ctx.lineWidth = 1.05; ctx.shadowBlur = 6; ctx.shadowColor = '#c3b0f080'; ctx.beginPath(); contours.forEach(pair => { ctx.moveTo(g.x + pair[0][0] / resolution * g.size, g.y + pair[0][1] / resolution * g.size); ctx.lineTo(g.x + pair[1][0] / resolution * g.size, g.y + pair[1][1] / resolution * g.size); }); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = '#e7d8ef9c'; ctx.lineWidth = 1; ctx.strokeRect(g.x, g.y, g.size, g.size);
      label(ctx, '0', g.x, g.y + g.size + 20, C.muted, 10, 'center'); label(ctx, '40 cm', g.x + g.size, g.y + g.size + 20, C.muted, 10, 'right'); label(ctx, 'Bright = still', g.x + g.size / 2, g.y + g.size + 20, C.text, 10, 'center');
      if (w > 600) { label(ctx, '+', g.x + g.size + 24, g.y + g.size / 2 - 15, C.copper, 16, 'center'); label(ctx, '−', g.x + g.size + 24, g.y + g.size / 2 + 15, C.lavender, 16, 'center'); }
    };
    v.hit = (x, y, w, h) => { const g = geometry(w, h), nx = (x - g.x) / g.size, ny = (y - g.y) / g.size; if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return 'The square boundary is held fixed. Explore inside to inspect displacement and nodes.'; const shape = membraneShape(nx, ny, m, n, blend * PI / 180); return 'x = ' + (nx * 40).toFixed(1) + ' cm, y = ' + (ny * 40).toFixed(1) + ' cm · mode amplitude ' + shape.toFixed(3) + ' · displacement ' + (shape * Math.cos(phase)).toFixed(3) + (Math.abs(shape) < .03 ? ' · near a node' : ' · arbitrary amplitude units'); };
    regenerate();
  }

  function livingPatternsView(v) {
    let presetName = 'coral', state = grayScottState(112, presetName), brushSize = 4, drawing = false, erase = false, stepRemainder = 0;
    const buffer = v.doc.createElement('canvas'); buffer.width = state.size; buffer.height = state.size;
    const bufferContext = buffer.getContext('2d'), pixels = bufferContext.createImageData(state.size, state.size);
    const read = v.readouts(['Model time', 'Mean concentration · V', 'Boundary']);
    const update = () => { let total = 0; for (const value of state.v) total += value; read[0]('t = ' + state.time.toFixed(1)); read[1]((total / state.v.length).toFixed(3)); read[2]('Wraps at every edge'); v.equation.textContent = '∂U/∂t = 0.16 ∇²U − UV² + F(1−U)   ·   ∂V/∂t = 0.08 ∇²V + UV² − (F+k)V'; };
    const presetButtons = [];
    const prepare = (name, developed) => {
      presetName = name; v.setPlaying(false); state = grayScottState(112, name); stepRemainder = 0;
      if (developed) grayScottStep(state, 3200);
      if (feedRange) feedRange.set(state.feed); if (killRange) killRange.set(state.kill);
      presetButtons.forEach(item => item.button.setAttribute('aria-pressed', String(item.name === name))); update(); v.redraw();
    };
    for (const [name, value] of Object.entries(GRAY_SCOTT_PRESETS)) { const b = v.button(value.label, () => prepare(name, true), v.presets); b.setAttribute('aria-pressed', String(name === presetName)); presetButtons.push({ name, button: b }); }
    v.playControl(null, ['Let it grow', 'Pause growth']);
    v.button('Reset to seed', () => prepare(presetName, false));
    v.button('Develop 500 steps', () => { grayScottStep(state, 500); update(); v.redraw(); });
    const eraser = v.button('Erase brush', () => { erase = !erase; eraser.setAttribute('aria-pressed', String(erase)); }); eraser.setAttribute('aria-pressed', 'false');
    const feedRange = v.range('Feed rate · F', .01, .08, .0005, state.feed, x => x.toFixed(4), x => { state.feed = x; presetButtons.forEach(item => item.button.setAttribute('aria-pressed', 'false')); update(); }, 'Dimensionless feed rate: U enters, and both fields are drained. Some settings settle into a nearly uniform state. Changing a rate continues the current simulation.');
    const killRange = v.range('Removal rate · k', .045, .072, .0005, state.kill, x => x.toFixed(4), x => { state.kill = x; presetButtons.forEach(item => item.button.setAttribute('aria-pressed', 'false')); update(); }, 'Dimensionless conversion rate of V into an inert product. Feed and removal together can change whether patterns persist, split or disappear.');
    v.range('Brush radius', 2, 10, 1, brushSize, x => Math.round(x) + ' cells', x => { brushSize = x; }, 'Draw on the field to replace a patch with U = 0.5, V = 0.5. Erasing restores U = 1, V = 0. The brush is a deliberate intervention, not spontaneous chemistry.');
    v.button('Seed at inspection point', () => { const p = v.pointer || { x: .5, y: .46 }; paint(p.x * v.width, p.y * v.height); v.announce('Applied the brush at the inspection point.'); }, v.ranges, 'Use arrow keys in the visual to move the inspection point, then activate this button.');
    v.canvas.style.touchAction = 'none';
    const instruction = v.make('p', 'ph-paint-instruction', 'Draw directly on the field to add a seed. Keyboard: move the inspection point with arrow keys, then use “Seed at inspection point”.', v.controls);
    instruction.id = 'ph-paint-' + mountCount; v.canvas.setAttribute('aria-describedby', v.canvas.getAttribute('aria-describedby') + ' ' + instruction.id);
    function geometry(w, h) { const size = Math.min(w - 54, h - 96); return { size, x: (w - size) / 2, y: (h - 44 - size) / 2 }; }
    function paint(x, y) { const g = geometry(v.width, v.height), nx = (x - g.x) / g.size, ny = (y - g.y) / g.size; if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) { grayScottBrush(state, nx, ny, brushSize, erase ? 0 : .5); update(); v.redraw(); } }
    function eventPoint(e) { const r = v.canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * v.width, y: (e.clientY - r.top) / r.height * v.height }; }
    v.on(v.canvas, 'pointerdown', e => { if (e.button !== 0 && e.pointerType !== 'touch') return; drawing = true; const p = eventPoint(e); paint(p.x, p.y); if (v.canvas.setPointerCapture) v.canvas.setPointerCapture(e.pointerId); });
    v.on(v.canvas, 'pointermove', e => { if (drawing) { const p = eventPoint(e); paint(p.x, p.y); } });
    v.on(v.canvas, 'pointerup', () => { drawing = false; }); v.on(v.canvas, 'pointercancel', () => { drawing = false; });
    v.tick = dt => { stepRemainder += dt * 600; const steps = Math.min(36, Math.floor(stepRemainder)); stepRemainder -= steps; if (steps) { grayScottStep(state, steps); update(); } };
    v.draw = (ctx, w, h) => {
      backdrop(ctx, w, h, '#24282e'); const g = geometry(w, h);
      label(ctx, 'GRAY–SCOTT / TWO REAGENTS', 25, 27, C.muted, w < 440 ? 9 : 10); label(ctx, 'DIMENSIONLESS', w - 25, 27, C.muted, w < 440 ? 9 : 10, 'right');
      for (let i = 0; i < state.v.length; i++) {
        const z = clamp(state.v[i] / .42, 0, 1), edge = Math.exp(-(((state.v[i] - .12) / .055) ** 2)), o = i * 4;
        pixels.data[o] = 15 + z * 197 + edge * 24; pixels.data[o + 1] = 19 + z * 142 + edge * 26; pixels.data[o + 2] = 28 + z * 112 + edge * 40; pixels.data[o + 3] = 255;
      }
      bufferContext.putImageData(pixels, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(buffer, g.x, g.y, g.size, g.size);
      ctx.strokeStyle = '#c3b0f04d'; ctx.lineWidth = 1; ctx.strokeRect(g.x, g.y, g.size, g.size);
      label(ctx, 'V = 0', g.x, g.y + g.size + 19, C.muted, 10); label(ctx, '0.42+ · bright', g.x + g.size, g.y + g.size + 19, C.copper, 10, 'right');
      const legend = ctx.createLinearGradient(g.x + g.size * .3, 0, g.x + g.size * .7, 0); legend.addColorStop(0, '#10131c'); legend.addColorStop(.5, '#8d7479'); legend.addColorStop(1, '#d4a18c'); ctx.fillStyle = legend; ctx.fillRect(g.x + g.size * .3, g.y + g.size + 10, g.size * .4, 5);
    };
    v.hit = (x, y, w, h) => { const g = geometry(w, h), nx = (x - g.x) / g.size, ny = (y - g.y) / g.size; if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return 'The field wraps around: each edge is joined to its opposite. All distances and times are dimensionless.'; const ix = clamp(Math.floor(nx * state.size), 0, state.size - 1), iy = clamp(Math.floor(ny * state.size), 0, state.size - 1), i = iy * state.size + ix; return 'Cell (' + ix + ', ' + iy + ') · U = ' + state.u[i].toFixed(3) + ', V = ' + state.v[i].toFixed(3) + ' · draw to ' + (erase ? 'erase' : 'add a seed'); };
    grayScottStep(state, 3200); update();
  }

  const views = { 'black-hole-light': blackHoleView, 'double-slit': doubleSlitView, tunnelling: tunnellingView, uncertainty: uncertaintyView, 'sound-patterns': soundPatternsView, 'living-patterns': livingPatternsView };
  function mount(mode, container) {
    if (!Object.prototype.hasOwnProperty.call(views, mode)) throw new RangeError('Unknown physics lab: ' + mode);
    if (!container || !container.ownerDocument) throw new TypeError('A DOM container is required');
    const viewer = createViewer(container, mode);
    try { views[mode](viewer); viewer.redraw(); } catch (error) { viewer.dispose(); throw error; }
    return viewer.dispose;
  }
  const models = Object.freeze({ CONSTANTS, ELECTRON_KINETIC, traceSchwarzschild, diffractionIntensity, detectorDistribution, sampleDetector, seededRandom, barrierTransmission, stationaryBarrier, gaussianPacket, normalDensity, membraneShape, membraneFrequency, GRAY_SCOTT_PRESETS, grayScottState, grayScottStep, grayScottBrush });
  const api = Object.freeze({ mount, modes: Object.keys(MODES), metadata: MODES, models, sources: SOURCES });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (global && global.document) global.PhysicsLabs = api;
})(typeof window !== 'undefined' ? window : globalThis);

