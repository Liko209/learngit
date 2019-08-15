function canOverflow(
  overflow: string | null,
  skipOverflowHiddenElements?: boolean,
) {
  if (skipOverflowHiddenElements && overflow === 'hidden') {
    return false;
  }

  return overflow !== 'visible' && overflow !== 'clip';
}

function isScrollable(el: Element, skipOverflowHiddenElements?: boolean) {
  if (el.clientHeight < el.scrollHeight || el.clientWidth < el.scrollWidth) {
    const style = getComputedStyle(el, null);
    return (
      canOverflow(style.overflowY, skipOverflowHiddenElements) ||
      canOverflow(style.overflowX, skipOverflowHiddenElements)
    );
  }

  return false;
}

const ancestorMap = new WeakMap();
function findScrollAncestor(el: Element) {
  const storedVal = ancestorMap.get(el);
  if (storedVal) {
    return storedVal;
  }
  let cursor = el.parentElement;
  while (cursor) {
    if (isScrollable(cursor, true)) {
      ancestorMap.set(el, cursor);
      return cursor;
    }
    cursor = cursor.parentElement;
  }
  return null;
}
export { findScrollAncestor };
