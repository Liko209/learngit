/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 09:39:57
 * Copyright © RingCentral. All rights reserved.
 */

/* eslint-disable */

//
// Fix chrome v73 passive event change
// https://github.com/facebook/react/issues/14856
//

(function() {
  const PASSIVE_EVENTS = [
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
    'wheel',
  ];

  // @ts-ignore
  const checkType = (type, options) => {
    if (!PASSIVE_EVENTS.includes(type)) return null;

    const modOptions = {
      boolean: {
        capture: options,
        passive: false,
      },
      object: {
        ...options,
        passive: false,
      },
    };

    return modOptions[typeof options];
  };

  // @ts-ignore
  const addEventListener = document.addEventListener.bind();
  // @ts-ignore
  document.addEventListener = (type, listener, options, wantsUntrusted) =>
    addEventListener(
      type,
      listener,
      checkType(type, options) || options,
      wantsUntrusted,
    );
  // @ts-ignore
  const removeEventListener = document.removeEventListener.bind();
  // @ts-ignore
  document.removeEventListener = (type, listener, options) =>
    removeEventListener(type, listener, checkType(type, options) || options);
})();
