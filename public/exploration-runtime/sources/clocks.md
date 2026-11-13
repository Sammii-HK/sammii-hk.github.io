# Black-hole clocks

The two clocks use the stationary Schwarzschild time-rate relation:

`dτ / dt = sqrt(1 − r_s / r) = sqrt(1 − 1/u)`, where `u = r / r_s`.

Reference: Andrew Hamilton, JILA, University of Colorado Boulder, **Schwarzschild geometry**, https://jila.colorado.edu/~ajsh/courses/bh/schwp.html.

The local slider spans `u = 1.05` to `20`. The far-away reference is a clock at infinity in the idealised Schwarzschild spacetime. The near clock is held stationary, so the result is not a freefall or orbit calculation. The model omits rotation, charge, acceleration limits and travel. Each clock reads normally to its own local observer.

Playback runs at ten model seconds per real second. Changing radius restarts both clocks, so the display never implies an instantaneous physical trip between radii. The picture is a schematic with compressed radial spacing, not a ray-traced view. At `u = 1.05`, the rate is approximately `0.218218`; at `u = 2`, `0.707107`; at `u = 20`, `0.974679`.

Reduced-motion preference starts the display paused. Unmounting stops animation and disconnects listeners and observers.
