# Physics & emergence labs — models, sources and verification

Prepared 12 November 2026. All canvas art, sampling code and numerical solvers in this module were written for this project. No source illustrations, simulations, screenshots, code or recorded audio are redistributed. The scientific equations and cited factual results are used to build original interactive explanations.

## Integration

Load `labs.css` and `labs.js`, then call:

```js
const dispose = window.PhysicsLabs.mount('black-hole-light', container);
// Before navigating away or replacing the exhibit:
dispose();
```

Supported identifiers:

| Identifier | Exhibit | Main interaction |
| --- | --- | --- |
| `black-hole-light` | Where light can go | Aim a beam, compare capture and escape, trace/scrub its path |
| `double-slit` | One arrival at a time | Build detector samples, change slit separation/wavelength, record which path |
| `tunnelling` | Through the forbidden | Change a rectangular barrier; inspect a matched wavefunction and transmission |
| `uncertainty` | A little less certain | Prepare a Gaussian packet and evolve a free electron in time |
| `sound-patterns` | The shape of a note | Blend equal-frequency square-membrane modes and inspect their nodes |
| `living-patterns` | Patterns that grow | Paint and evolve an actual Gray–Scott reaction–diffusion field |

`PhysicsLabs.metadata`, `.sources`, `.modes`, and `.models` are available for the shell and testing. The CommonJS export has the same properties and imports without a DOM. CSS is scoped to `.ph-root`; `.ph-header` may be hidden if the host renders its own heading. Each mount owns its event handlers, animation frames, resize observer, and optional audio; the returned function cleans them up.

No runtime network or third-party dependency is required. Source links open only when activated. All views initially pause. Reduced-motion preference changes pause a running view; the user can explicitly start playback. Numeric controls, readouts and model notes provide a text alternative. Inspecting the canvas works by pointer, tap and keyboard arrows. Control explanations work on hover, keyboard focus and tap. Reaction–diffusion painting also has a keyboard-accessible seeding button. Optional membrane audio requires an explicit Listen action and is muted/closed on cleanup.

## 1. Schwarzschild light paths

**Source:** Max Tegmark, MIT course 8.033, *Schwarzschild metric & black holes*, revised 29 November 2005, photon-orbit section and horizon discussion: <https://ocw.mit.edu/courses/8-033-relativity-fall-2006/5dae4a0c2d69b367951ddea5e17a2cea_schwarzschild.pdf>.

The non-rotating, uncharged, isolated-hole model is expressed in Schwarzschild-radius units. With `u = r_s/r` and dimensionless impact parameter `b`, differentiating the photon radial first integral gives:

```text
(du/dφ)² + u² − u³ = 1/b²
d²u/dφ² = −u + 3u²/2
```

The code uses fourth-order Runge–Kutta with angular step 0.0025 radians. Its finite start radius is at least `40 r_s` and at least `20 b`; Simpson integration from infinity sets the incoming asymptote. Integration stops at the event horizon, or when an outgoing ray returns to the start radius. The omitted outer tail is included in the escaping ray’s deflection angle.

Critical impact parameter is `3√3/2 r_s`; the photon sphere has areal radius `1.5 r_s`. Exactly critical input is shown as a finite prefix of the asymptotic approach, not as a numerically proved eternal orbit. Other trajectories have a bounded angular integration budget, with an explicit unresolved outcome if that budget is exceeded.

**Interpretation limits:** The plot is a coordinate-path map in an orbital plane. It is not an observed black-hole shadow, an accretion image, or a Euclidean proper-distance map. Tracing progress is not a clock. Rays are launched from outside and stop at the horizon; nothing depicts light escaping from the interior. Decorative glow has no quantitative radiation meaning.

## 2. Single-event double slit

**Sources:**

- OpenStax / Rice University, *University Physics Volume 3*, §4.3, two-slit diffraction and single-slit envelope: <https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction>.
- Richard Feynman, Robert Leighton and Matthew Sands, Caltech, *The Feynman Lectures on Physics*, Vol. III, chapter 1, amplitude addition, individual arrivals and path discrimination: <https://www.feynmanlectures.caltech.edu/III_01.html>.

The model uses equally illuminated rectangular slits in the paraxial Fraunhofer limit:

```text
I(y) ∝ sinc²(π a y / λL) × [1 + γ cos(2π d y / λL)] / 2
```

The UI switches between `γ = 1` and `γ = 0`. In the latter idealisation a path-recording system has orthogonal records, so its unobserved state removes the cross term. The individual-slit envelope is assumed unchanged. The distinction concerns physical distinguishability, with no role assigned to human consciousness.

Slit width is 35 µm, separation is 90–300 µm, wavelength is 400–700 nm, and screen distance is 1 m. The displayed screen spans ±12 mm. At these bounds `|y/L| ≤ 0.012`, making the paraxial screen-angle approximation explicit and small. The density is normalised **within this displayed window** using 1,600 bins. The seeded event sequence is sampled by inverse CDF with interpolation inside each bin. The vertical dot placement is decorative; only horizontal positions represent the one-dimensional detector distribution. Regenerating after a control change reuses random variates against the new distribution for a clear comparison.

## 3. Rectangular-barrier scattering

**Sources:**

- Richard Fitzpatrick, University of Texas at Austin, *Quantum Mechanics*, square potential barrier: <https://farside.ph.utexas.edu/teaching/qmech/Quantum/node48.html>.
- NIST, CODATA 2022 constants: <https://physics.nist.gov/cuu/Constants/>. Electron mass `9.1093837139×10⁻³¹ kg`; exact SI Planck constant `6.62607015×10⁻³⁴ J s` and eV conversion `1.602176634×10⁻¹⁹ J` are used.

All user energies are in eV and widths in nm. The derived kinetic coefficient is `A = ħ²/(2m_e)` in eV nm². For positive electron energy `E`, barrier height `V`, and width `a`:

```text
E < V: T = 1 / [1 + V² sinh²(κa) / (4E(V−E))],  κ² = (V−E)/A
E > V: T = 1 / [1 + V² sin²(qa) / (4E(E−V))],   q² = (E−V)/A
E = V: T = 1 / [1 + V a² / (4A)]
```

The implementation uses `sinc`/`sinhc` limits near threshold and a logarithmic large-exponent branch for thick barriers. The plotted stationary complex wavefunction is derived by matching its value and derivative at both edges. Below-barrier exponentials are scaled so opaque barriers do not cause overflow. The wave on the incident side includes reflection; the transmitted side has the correct amplitude and phase. Density and real-wave views have their own labelled vertical scales, independent of the energy-profile scale.

**Interpretation limits:** This is a single-energy, nonrelativistic, stationary 1D state, with identical zero exterior potentials. It does not compute a wavepacket traversal time. Global phase playback is intentionally slowed. The electron’s energy is conserved; no temporary energy borrowing is asserted.

## 4. Gaussian preparation and free spreading

**Sources:** Richard Fitzpatrick, University of Texas at Austin:

- Position–momentum uncertainty and Gaussian states: <https://farside.ph.utexas.edu/teaching/qmech/Quantum/node39.html>.
- Gaussian Fourier-pair construction: <https://farside.ph.utexas.edu/teaching/qmech/Quantum/node25.html>.
- Free time evolution: Barton Zwiebach, MIT 8.04, Lecture 7, §3, *Time evolution of a free wave packet*: <https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/6ca5bd79a2121967796f7c0b8f6f48c9_MIT8_04S16_LecNotes7.pdf>.

The free-spreading formula is the analytic propagation of that initial Gaussian by the free Schrödinger equation. For initial standard deviation `s`, zero mean position and zero mean momentum:

```text
τ = ħt / (2 m s²)
σx(t) = s √(1 + τ²)
σp = ħ/(2s)
Cov(x,p) = ħτ/2
σx²σp² − Cov(x,p)² = ħ²/4
```

Position uses nm, time uses fs, and the numeric momentum coordinate uses ħ/nm. The two normalised densities are plotted with fixed axes, so control changes do not silently rescale the spread. At preparation the usual product is ħ/2; subsequent free evolution increases the position spread while momentum spread stays fixed. This is a state property across separate repeated preparations. The pair of plots is not a joint simultaneous measurement and does not reduce uncertainty to measurement disturbance.

## 5. Square membrane modes

**Source:** Daniel A. Russell, Pennsylvania State University Graduate Program in Acoustics, *Vibrational Modeshapes of a Rectangular Membrane*, including square-membrane degeneracy: <https://www.acs.psu.edu/drussell/Demos/rect-membrane/rect-mem.html>.

The scalar field is an original implementation of the analytic fixed-edge eigenfunctions:

```text
Φmn(x,y) = sin(mπx/L) sin(nπy/L)
Φ(x,y) = cos θ Φmn + sin θ Φnm
z(x,y,t) ∝ Φ(x,y) cos(2πft)
f = c √(m²+n²)/(2L)
```

Illustrative parameters are `L = 0.4 m` and `c = 80 m/s`. The two terms have the same frequency on a square. Nine mode pairs and signed blending are available. A marching-squares contour at finite display resolution marks the zeros of the **mode shape**, rather than treating every point as a permanent node when the instantaneous displacement crosses zero. Pixel-level ambiguity can remain at degenerate contour crossings.

**Interpretation limits:** This is an ideal tensioned membrane with fixed edges, not a metal plate or a sand-transport calculation. Display amplitude and colour are arbitrary, and visible vibration is slowed to 0.35 cycles/s. The optional pure sine tone is synthetic and does not reproduce a real membrane’s full timbre or radiation field. All rendering is original; the source animations are not reused.

## 6. Gray–Scott emergence

**Primary sources:**

- John E. Pearson, *Complex Patterns in a Simple System*, Science **261** (1993), 189–192, DOI `10.1126/science.261.5118.189`: <https://arxiv.org/abs/patt-sol/9304003>. The research paper describes dimensionless reaction–diffusion equations, finite perturbations, periodic boundaries, and a range of pattern behaviour.
- Hal Abelson and collaborators, MIT CSAIL, Gray–Scott model and numerical-method discussion: <https://groups.csail.mit.edu/mac/projects/amorphous/GrayScott/>.

```text
∂U/∂t = Du ∇²U − UV² + F(1−U)
∂V/∂t = Dv ∇²V + UV² − (F+k)V
```

The browser evolves a 112×112 grid, with dimensionless spacing 1, `Du = 0.16`, `Dv = 0.08`, and a five-point Laplacian. Opposite boundaries are periodic. These grid units differ from the spatial normalisation used in Pearson’s published figures; this module is an original numerical exploration of the model, not a reproduction of those figures.

Forward-Euler steps satisfy all of:

```text
Δt ≤ 0.5
Δt ≤ 0.9 / (4Du + max(V)² + F)
Δt ≤ 0.9 / (4Dv + F + k)
```

The latter bounds keep the finite-difference update coefficients nonnegative. Concentration values are not clipped by the solver. Only their **display colours** saturate at the labelled palette limit. A reduction of the timestep changes the actual model-time increment. In the normal presets the step remains 0.5.

| Preset name | Feed F | Removal k |
| --- | ---: | ---: |
| Spots | 0.035 | 0.065 |
| Stripes | 0.030 | 0.058 |
| Coral | 0.0545 | 0.062 |

Names describe visual tendencies. These parameters were checked by running the actual solver and inspecting its output; initial conditions, domain size and time affect their appearance. The deterministic seed contains several finite patches. Choosing a preset first develops it for 3,200 numerical steps; the displayed clock therefore starts at `t = 1600`. Reset returns to its unevolved seed, and growth is paused until explicitly started. Painting is a deliberate replacement of local concentrations, not an unmodelled claim about natural chemistry. No claim is made that this simple model explains actual coral, animal markings, or biological life.

## Verification

Run:

```sh
node --test creative/atlas/labs/tests/models.test.js
```

The 30 model tests cover:

- Horizon termination; capture/escape threshold; critical approach; geodesic first-integral error and step convergence; weak-field deflection and signed symmetry.
- Interference zeros, single-slit envelope, removal of the cross term, detector normalisation/symmetry, and statistical agreement of sampled arrivals.
- Barrier threshold continuity, resonances, absent/opaque limits, wavefunction and derivative matching, and conserved incident/reflected/transmitted flux.
- Gaussian normalisation, second moments, minimum uncertainty at preparation, preserved momentum spread and the covariance relation during evolution.
- Membrane fixed boundaries, nodal positions, degenerate frequencies, and the Laplacian eigenvalue relation.
- Gray–Scott homogeneous stationarity, local kinetics, periodic edge transport, closed-system total concentration, positivity under high concentration, stable nonuniform preset runs, timestep convergence, and brush/domain validation.

Browser integration and visual/accessibility QA belong to the host application. This test suite does not claim a full accessibility audit, numerical convergence at every possible parameter setting, or experimental validation of the idealised systems.
