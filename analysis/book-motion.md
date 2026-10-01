# Book motion: geometry and verification

## Multiple-sheet turns

A turn of distance d spreads uses n=min(abs(d),5) animated sheets. Stops are round(from+d*i/n), i=0..n, so endpoints are exact and order is monotonic. A five-spread action shows every intermediate spread; longer slider jumps sample intermediate spreads instead of building hundreds of surfaces. Each sheet uses the existing tangent geometry.

Fast sheets use 660 ms duration and 105 ms staggering (art direction settings), giving 1080 ms for a five-sheet fan. All tracks share the same timeline. Sheet depth changes from 1+(n-i)/n to 1+(i+1)/n CSS pixels, putting the earliest source sheet in front at the start and the latest landed sheet in front at the end. Reduced motion settles the target directly. Additional requests update the destination and are processed after the current fan lands. Bounds are clamped to the first/last spread.

The fan uses 8 strips and 24 keyframe intervals per sheet, versus 16/48 for a single turn. Fast turns retain the shared cast shadows instead of adding per-strip shade layers; the night film holds its painted frame while the sheets move. This reduces the five-sheet fan from 240 strip/shade animation tracks to 40 strip tracks, plus sheet depth and cast shadows. The choice was motivated by local frame timing and checked visually against the five-sheet screenshot; it does not change the endpoint geometry or page order.

Local timing is captured in `analysis/quick-turn-performance.json`; it is not a guarantee for other devices. Functional checks are in `checks/quick-turn-check.mjs`.

The previous opening changed cover width from 76% to 50% on mobile, reflowing its text during rotation. The inside cover then disappeared to reveal different text on the left page. Cancelling the animation before setting its final state also risked a reset frame.

The new cover has fixed dimensions. The whole book translates from -25% of spread width to zero while the cover rotates from 0 to -180 degrees about its spine. This centers both the closed book and the open spread. The inside cover and resting left page share content, dimensions and padding. Animation tracks share a timeline, and final styles are set before effects are cancelled. Images and fonts are ready before the cover becomes interactive.

## Paper geometry

`src/book-motion.js` implements an art-directed surface, not calibrated paper physics. Progress p and normalized distance u across the page are in [0,1]; angles are radians and distances are CSS pixels.

    theta(p,u) = -pi*p + A*sin(pi*p)*sin(pi*u)

The backward angle is `-pi - theta`. A=pi/5 (36 degrees) gives a gentle bow without reversing the tangent. Curl is exactly zero at both endpoints. Divide width W into N equal strips, ds=W/N. Starting at the spine x=z=0:

    x_next = x + ds*cos(theta)
    z_next = z - ds*sin(theta)

CSS positive z faces the viewer. Adjacent strips share endpoints. Reverse surfaces reverse strip ordering while preserving readable text. A one-device-pixel overlap (`1/devicePixelRatio` CSS pixels) covers rasterization cracks.

| Parameter | Rationale |
| --- | --- |
| 16 strips | Maximum 520 px page gives 32.5 px strips; limits temporary faces to 32. Intermediate poses visually checked. |
| 48 keyframe intervals | Samples a 1150 ms turn about every 24 ms; the browser interpolates display frames between these samples. |
| Open 1600 ms; close 1350 ms; turn 1150 ms | Design pacing: opening a hardcover is slower than turning one paper page. |
| Cubic-bezier(.42,0,.22,1) | Starts and stops with zero velocity; longer settling portion. |
| Paper shade ceiling .22 | Design opacity, not a photometric measurement. Cast shadows also use bounded design opacities. |
| Perspective 2200 px; cover edge 2 px | CSS camera and hardcover styling; not real-world dimensions. |

This uses browser 3D transforms. It does not perform cloth simulation, ray tracing or Blender rendering. Bending varies across page width; corner creases are outside this geometry.

## Checks

`checks/book-motion-check.mjs` pauses actual browser animations at intermediate poses, saves screenshots, checks invariant cover width and matching inside-cover text, and records frame intervals in `analysis/book-motion-performance.json`. Measurements apply to this browser and machine. Layout counters cover the whole document.

`checks/browser-check.mjs` checks open/close, forward/backward turns, slider and rapid seeking, ordering, zoom, reduced motion, 320/375/768 px layouts, and existing portfolio interactions.

Browser references: [animation performance](https://web.dev/articles/animations-guide), [preserving animation endpoints](https://developer.mozilla.org/en-US/docs/Web/API/Animation/commitStyles). This implementation assigns final styles directly before cancelling effects.
