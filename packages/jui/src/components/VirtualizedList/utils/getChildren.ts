/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 16:42:36
 * Copyright © RingCentral. All rights reserved.
 */
const slice = Array.prototype.slice;

const getChildren = (contentEl: HTMLElement | null): HTMLElement[] => {
  return contentEl !== null ? slice.call(contentEl.children, 0) : [];
};

export { getChildren };
