export function visibleInWindow(el: Element | null) {
  if (el instanceof Element) {
    const { top, bottom } = el.getBoundingClientRect();
    const viewHeight = Math.max(
      document.documentElement!.clientHeight,
      window.innerHeight,
    );
    return !(bottom <= 0 || top >= viewHeight);
  }
  return false;
}
