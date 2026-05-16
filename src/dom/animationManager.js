const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AnimateMove(cellEl) {
  if (reducedMotion) return Promise.resolve();
  return Animate(cellEl, 'anim-move', 250);
}

export function AnimateAttack(cellEl) {
  if (reducedMotion) return Promise.resolve();
  return Animate(cellEl, 'anim-attack', 300);
}

export function AnimateMutate(cellEl) {
  if (reducedMotion) return Promise.resolve();
  return Animate(cellEl, 'anim-mutate', 350);
}

function Animate(el, className, duration) {
  return new Promise(resolve => {
    el.classList.add(className);
    setTimeout(() => {
      el.classList.remove(className);
      resolve();
    }, duration);
  });
}
