/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-02 18:04:31
 * Copyright © RingCentral. All rights reserved.
 */

function getPopup(popupId?: string): HTMLElement | null {
  return popupId && typeof document !== 'undefined'
    ? document.getElementById(popupId)
    : null;
}

function isAncestor(
  parent?: EventTarget | null,
  child?: EventTarget | null,
): boolean {
  if (!parent) return false;
  while (child) {
    if (child === parent) return true;
    if (child instanceof HTMLElement) {
      child = child.parentElement;
    } else {
      child = null;
    }
  }
  return false;
}

function isElementInPopup({
  popupId,
  element,
  anchorEl,
}: {
  element: EventTarget;
  popupId?: string;
  anchorEl?: HTMLElement;
}): boolean {
  return (
    isAncestor(anchorEl, element) || isAncestor(getPopup(popupId), element)
  );
}

export { getPopup, isElementInPopup, isAncestor };
