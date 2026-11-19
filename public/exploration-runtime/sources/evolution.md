# Worlds in Time: model, sources and limits

This is a separate, offline numerical surface-process experiment. It does not replace the atlas's geological process illustration or claim reconstructed palaeogeography.

## Implemented model

The state is a 128 × 64 equal-area grid (longitude and μ = sin(latitude)) of height in km, a material-colour index and a decaying activity field. At each of 180 steps over 4,500 model Myr:

1. Solve linear topographic diffusion on a sphere using a conservative finite-volume flux in μ and periodic longitude. The equation is ∂h/∂t = κ/R² [∂μ((1−μ²)∂μh) + ∂²λh/(1−μ²)]. Explicit substeps keep the maximum off-diagonal row sum times the step below 0.45. Polar boundary flux is zero. Diffusion preserves the equal-area mean, while construction and impacts can change it.
2. Add seeded stochastic impacts with a declining synthetic frequency. Independent process streams generate a fixed maximum-rate candidate catalogue; acceptance thinning ensures changing volcanism does not change bombardment and lower impact rates select a subset of the same candidates. Craters use a smooth bowl and rim profile; these are not hydrocode impact solutions or calibrated crater scaling.
3. Add local volcanic or icy deposition. This raises terrain and partially fills depressions. A small prescribed uplift field is applied to selected rocky worlds; it is not plate tectonics.
4. Calculate heat analytically from dH/dt = −(H − Heq)/τ. Preset tidal heating raises the equilibrium. H is a dimensionless activity proxy, not kelvin or physical heat flow. Radioactive heating and interior transport are not independently solved.
5. Store a complete snapshot, including terrain and material. Scrubbing reads stored numerical state. A user impact is inserted at its chosen step and the future is recomputed with the same seed; earlier snapshots remain unchanged.

Preset radii approximately match their named bodies. All process coefficients, initial terrain, event rates, crater sizes and global visual textures are deliberately simplified. In particular, the large-scale diffusion coefficients are accelerated to make change visible on a coarse globe: they must not be interpreted as measured lunar or planetary diffusivities. The time axis is a model coordinate, not an account of actual history. Icy cracks, colours, apparent ocean and molten areas are illustrative renderings of state, not climate or fracture mechanics solutions.

## Sources accessed 12 November 2026

- Fassett, C. I. & Thomson, B. J. (2014), *Crater degradation on the lunar maria: Topographic diffusion and the rate of erosion on the Moon*, Journal of Geophysical Research: Planets. https://doi.org/10.1002/2014JE004698 . Supports diffusion as a first-order crater-degradation framework. Their calibrated value (about 5.5 m²/Myr for the examined lunar maria) is **not** adopted by this globe-scale visual model.
- NASA, Moon Formation. https://science.nasa.gov/moon/formation/ . Early impact origin, magma ocean and cooling context.
- NASA, Io. https://science.nasa.gov/jupiter/jupiter-moons/io/ . Tidal heating, active volcanism and resurfacing context.
- NASA, Europa Facts. https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/ . Young icy surface, scarce craters and fractures. The visual fracture overlay is not measured geographic data.
- NASA, Enceladus. https://science.nasa.gov/saturn/moons/enceladus/ . Icy active moon context; this model does not resolve its south-polar jets.
- NASA/NSSDCA, Planetary Fact Sheet. https://nssdc.gsfc.nasa.gov/planetary/factsheet/ . Approximate mean radii, with moon values from NASA body pages.

## Verification

Pure-model tests cover conservation and maximum-principle bounds for diffusion, deterministic seeded histories, genuine state alteration from impacts, unchanged pre-impact snapshots, late tidal heating, process-off controls, finite histories for all eight presets, and valid sampling at the poles and longitude seam. Browser verification is recorded in the parent QA.md.
