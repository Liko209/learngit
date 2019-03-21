/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:42:36
 * Copyright © RingCentral. All rights reserved.
 */
const slice = Array.prototype.slice;

const getChildren = (element: HTMLElement | null): HTMLElement[] => {
  return element !== null ? slice.call(element.children, 0) : [];
};

export { getChildren };
