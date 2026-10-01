// A geometric paper surface, art-directed rather than a physical material solver.
// Units: CSS pixels and radians. See analysis/book-motion.md for derivation.
export const MOTION = Object.freeze({
  openMs: 1600, closeMs: 1350, turnMs: 1150,
  strips: 16, samples: 48, curlRadians: Math.PI / 5,
  easing: 'cubic-bezier(.42,0,.22,1)',
  // Art-directed fanned turns: up to five sheets, 105 ms apart.
  burstMs:660, staggerMs:105, maxSheets:5,
  burstStrips:8, burstSamples:24,
});
const preference = matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => document.body.classList.contains('motion-off') || preference.matches;

// Every track starts on the same document timeline. Commit endpoints before
// removing effects, so no frame can fall back to the old CSS transform.
export async function play(tracks, duration) {
  if (reducedMotion()) {
    for (const {element, frames} of tracks) Object.assign(element.style, frames.at(-1));
    return;
  }
  const animations = tracks.map(({element, frames, delay=0, duration:trackDuration=duration}) => element.animate(frames, {
    duration:trackDuration, delay, easing: MOTION.easing, fill: 'both',
  }));
  const start = document.timeline.currentTime;
  animations.forEach(animation => { animation.startTime = start; });
  const finish = () => { if (reducedMotion()) animations.forEach(animation => animation.finish()); };
  const button = document.querySelector('#motion-toggle');
  button?.addEventListener('click', finish);
  preference.addEventListener('change', finish);
  try { await Promise.all(animations.map(animation => animation.finished)); }
  finally {
    animations.forEach((animation, i) => {
      Object.assign(tracks[i].element.style, tracks[i].frames.at(-1));
      animation.cancel();
    });
    button?.removeEventListener('click', finish);
    preference.removeEventListener('change', finish);
  }
}

export async function decodeImages(element) {
  await Promise.all([...element.querySelectorAll('img')].map(image => image.decode().catch(() => {})));
}

// Integral of the tangent field is approximated by equal-length rigid strips.
// Adjacent strips share endpoints: x += ds*cos(theta), z -= ds*sin(theta).
// At p=0 / p=1 the curl is zero and every strip lies exactly on its resting page.
export function paperTracks(sheet, frontPage, backPage, width, height, forward, fast=false) {
  const count = fast?MOTION.burstStrips:MOTION.strips, samples=fast?MOTION.burstSamples:MOTION.samples, step = width / count;
  const trajectories = Array.from({length: count}, () => []);
  const lighting = Array.from({length: count}, () => []);
  for (let frame = 0; frame <= samples; frame++) {
    const p = frame / samples;
    let x = 0, z = 0;
    for (let strip = 0; strip < count; strip++) {
      const u = (strip + .5) / count;
      const rotation = -Math.PI * p + MOTION.curlRadians * Math.sin(Math.PI * p) * Math.sin(Math.PI * u);
      const angle = forward ? rotation : -Math.PI - rotation;
      trajectories[strip].push({transform: `translate3d(${x}px,0,${z}px) rotateY(${angle}rad)`});
      lighting[strip].push({opacity: String(.22 * Math.abs(Math.sin(angle)))});
      x += step * Math.cos(angle); z -= step * Math.sin(angle);
    }
  }
  const tracks = [];
  for (let i = 0; i < count; i++) {
    const strip = document.createElement('div'); strip.className = 'paper-strip';
    strip.style.width = `${step}px`;
    for (const [back, source] of [[false, frontPage], [true, backPage]]) {
      const face = document.createElement('div'); face.className = `paper-surface${back ? ' paper-reverse' : ''}`;
      // One physical pixel of overlap covers antialiasing cracks between planes.
      const overlap = 1 / devicePixelRatio;
      face.style.width = `${step + overlap}px`;
      const texture = source.cloneNode(true); texture.removeAttribute('id');
      texture.className = `book-page paper-texture ${back ? 'page-left' : 'page-right'}`;
      texture.style.width = `${width}px`; texture.style.height = `${height}px`;
      // Reverse side mirrors the strip ordering, not the readable text.
      const index = back ? count - 1 - i : i;
      texture.style.left = `${-index * step - (back ? overlap : 0)}px`;
      face.append(texture);
      // A fast fan uses the shared cast shadows, avoiding 80 extra composited
      // shade layers. Single-page reading keeps the finer tangent lighting.
      if(!fast){
       const shade = document.createElement('div'); shade.className = 'paper-shade'; face.append(shade);
       tracks.push({element: shade, frames: lighting[i]});
      }
      strip.append(face);
    }
    sheet.append(strip); tracks.push({element: strip, frames: trajectories[i]});
  }
  return tracks;
}
