/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-05 14:12:57
 * Copyright © RingCentral. All rights reserved.
 */
import { debounce } from 'lodash';
import ReactDOM from 'react-dom';

function getScrollParent(element: HTMLElement, includeHidden: boolean = false) {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = includeHidden
    ? /(auto|scroll|hidden)/
    : /(auto|scroll)/;

  if (style.position === 'fixed') return document.body;
  let parent: HTMLElement | null = element;
  do {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') {
      continue;
    }

    const overflow = style.overflow || '';
    const overflowX = style.overflowX || '';
    const overflowY = style.overflowY || '';

    if (overflowRegex.test(overflow + overflowX + overflowY)) {
      return parent;
    }
  } while ((parent = parent.parentElement));

  return document.body;
}

function addScrollEndListener(
  el: HTMLElement,
  callback: (event?: UIEvent) => void,
) {
  const SCROLL_END_DETECT_DEBOUNCE = 100;
  const debounceCallback = debounce(() => {
    callback();
    el.removeEventListener('scroll', debounceCallback);
  },                                SCROLL_END_DETECT_DEBOUNCE);
  el.addEventListener('scroll', debounceCallback);
  // When no scroll happened, we need to callback too.
  window.requestAnimationFrame(() => debounceCallback());
}

async function scrollToComponent(
  component?: React.ReactInstance | null,
  options?: boolean | ScrollIntoViewOptions,
) {
  return new Promise((resolve, reject) => {
    if (!component) return;
    try {
      const el = ReactDOM.findDOMNode(component);
      if (el && el instanceof HTMLElement) {
        el.scrollIntoView(options);
        addScrollEndListener(getScrollParent(el), resolve);
      }
    } catch (err) {
      resolve();
      console.warn(err);
    }
  });
}

async function nextTick() {
  return new Promise((resolve: Function) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export { scrollToComponent, nextTick, getScrollParent };
