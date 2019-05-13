function noop() { }

function isTextOverflow(el: HTMLElement) {
  return el.offsetWidth < el.scrollWidth;
}

export {
  isTextOverflow,
  noop,
};
