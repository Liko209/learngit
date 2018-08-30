const visibilityChangeEvent = (handleVisibilityChange) => {
  let hidden;
  let visibilityChange = 'visibilitychange';
  if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }
  document.addEventListener(
    visibilityChange,
    handleVisibilityChange,
    false,
  );
}

export default visibilityChangeEvent;
