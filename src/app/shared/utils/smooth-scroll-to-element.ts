// Native `scrollIntoView({behavior:'smooth'})` duration isn't controllable
// across browsers, so a slower/gentler scroll needs a manual rAF animation.
export function smoothScrollToElement(
  element: HTMLElement,
  offset: number = 0,
  duration: number = 1000,
): void {
  const startY = window.scrollY;
  const targetY =
    element.getBoundingClientRect().top + startY - offset;
  const distance = targetY - startY;
  let startTime: number | null = null;

  const easeInOutQuad = (t: number): number =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  const step = (timestamp: number) => {
    if (startTime === null) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuad(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}
