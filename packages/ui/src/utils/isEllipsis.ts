/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:46
 * Copyright © RingCentral. All rights reserved.
 */
function isTextOverflow(el: HTMLElement) {
  return el.offsetWidth < el.scrollWidth;
}

export { isTextOverflow };
