/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
type viewItemType = {
  div: HTMLDivElement;
  id: number;
};

type SpotType = {
  left: number | null;
  top: number | null;
};

type WatchScrollStateType = {
  right: boolean;
  down: boolean;
  lastX: number;
  lastY: number;
  _eventHandler: () => void;
};

function binarySearchFirstItem(items: viewItemType[], condition: any) {
  let minIndex = 0;
  let maxIndex = items.length - 1;

  if (items.length === 0 || !condition(items[maxIndex])) {
    return items.length;
  }
  if (condition(items[minIndex])) {
    return minIndex;
  }

  while (minIndex < maxIndex) {
    const currentIndex = (minIndex + maxIndex) >> 1;
    const currentItem = items[currentIndex];
    if (condition(currentItem)) {
      maxIndex = currentIndex;
    } else {
      minIndex = currentIndex + 1;
    }
  }
  return minIndex;
}

function backtrackBeforeAllVisibleElements(
  index: number,
  views: viewItemType[],
  top: number,
) {
  if (index < 2) {
    return index;
  }

  let elt = views[index].div;
  let pageTop = elt.offsetTop + elt.clientTop;

  if (pageTop >= top) {
    elt = views[index - 1].div;
    pageTop = elt.offsetTop + elt.clientTop;
  }

  for (let i = index - 2; i >= 0; --i) {
    elt = views[i].div;
    if (elt.offsetTop + elt.clientTop + elt.clientHeight <= pageTop) {
      break;
    }
    // tslint:disable-next-line: no-parameter-reassignment
    index = i;
  }
  return index;
}

const getVisibleElements = (scrollEl: HTMLElement, views: viewItemType[]) => {
  const top = scrollEl.scrollTop;
  const bottom = top + scrollEl.clientHeight;
  const left = scrollEl.scrollLeft;
  const right = left + scrollEl.clientWidth;

  function isElementBottomAfterViewTop(view: viewItemType) {
    const element = view.div;
    const elementBottom =
      element.offsetTop + element.clientTop + element.clientHeight;
    return elementBottom > top;
  }

  const visible = [];
  const numViews = views.length;
  let firstVisibleElementInd =
    numViews === 0
      ? 0
      : binarySearchFirstItem(views, isElementBottomAfterViewTop);

  if (firstVisibleElementInd > 0 && firstVisibleElementInd < numViews) {
    firstVisibleElementInd = backtrackBeforeAllVisibleElements(
      firstVisibleElementInd,
      views,
      top,
    );
  }

  let lastEdge = -1;

  for (let i = firstVisibleElementInd; i < numViews; i++) {
    const view: viewItemType = views[i];
    const element = view.div;
    const currentWidth = element.offsetLeft + element.clientLeft;
    const currentHeight = element.offsetTop + element.clientTop;
    const viewWidth = element.clientWidth;
    const viewHeight = element.clientHeight;
    const viewRight = currentWidth + viewWidth;
    const viewBottom = currentHeight + viewHeight;

    if (lastEdge === -1) {
      if (viewBottom >= bottom) {
        lastEdge = viewBottom;
      }
    } else if (currentHeight > lastEdge) {
      break;
    }

    if (
      viewBottom <= top ||
      currentHeight >= bottom ||
      viewRight <= left ||
      currentWidth >= right
    ) {
      continue;
    }

    const hiddenHeight =
      Math.max(0, top - currentHeight) + Math.max(0, viewBottom - bottom);
    const hiddenWidth =
      Math.max(0, left - currentWidth) + Math.max(0, viewRight - right);
    const percent =
      (((viewHeight - hiddenHeight) * (viewWidth - hiddenWidth) * 100) /
        viewHeight /
        viewWidth) |
      0;
    visible.push({
      view,
      percent,
      id: view.id,
      x: currentWidth,
      y: currentHeight,
    });
  }

  const first = visible[0];
  const last = visible[visible.length - 1];

  return { first, last, views: visible };
};

const scrollIntoViewWithContainer = (
  target: viewItemType,
  containerEl: HTMLDivElement,
  spot: number,
) => {
  const targetEl = target.div;
  if (targetEl && containerEl) {
    containerEl.scrollTop = targetEl.offsetTop + spot;
  }
};

function scrollIntoView(
  element: HTMLElement,
  spot?: SpotType,
  skipOverflowHiddenElements: boolean = false,
) {
  let parent = element.offsetParent as HTMLElement;
  if (!parent) {
    console.error('offsetParent is not set -- cannot scroll');
    return;
  }
  let offsetY = element.offsetTop + element.clientTop;
  let offsetX = element.offsetLeft + element.clientLeft;
  while (
    (parent.clientHeight === parent.scrollHeight &&
      parent.clientWidth === parent.scrollWidth) ||
    (skipOverflowHiddenElements &&
      getComputedStyle(parent).overflow === 'hidden')
  ) {
    if (parent.dataset._scaleY) {
      // @ts-ignore
      offsetY /= parent.dataset._scaleY;
      // @ts-ignore
      offsetX /= parent.dataset._scaleX;
    }
    offsetY += parent.offsetTop;
    offsetX += parent.offsetLeft;
    parent = parent.offsetParent as HTMLElement;
    if (!parent) {
      return;
    }
  }
  if (spot) {
    if (spot.top !== undefined) {
      // @ts-ignore
      offsetY += spot.top;
    }
    if (spot.left !== undefined) {
      // @ts-ignore
      offsetX += spot.left;
      parent.scrollLeft = offsetX;
    }
  }
  parent.scrollTop = offsetY;
}

function normalizeWheelEventDelta(evt: WheelEvent) {
  let delta = Math.sqrt(evt.deltaX * evt.deltaX + evt.deltaY * evt.deltaY);
  const angle = Math.atan2(evt.deltaY, evt.deltaX);
  if (-0.25 * Math.PI < angle && angle < 0.75 * Math.PI) {
    delta = -delta;
  }

  const MOUSE_DOM_DELTA_PIXEL_MODE = 0;
  const MOUSE_DOM_DELTA_LINE_MODE = 1;
  const MOUSE_PIXELS_PER_LINE = 30;
  const MOUSE_LINES_PER_PAGE = 30;

  if (evt.deltaMode === MOUSE_DOM_DELTA_PIXEL_MODE) {
    delta /= MOUSE_PIXELS_PER_LINE * MOUSE_LINES_PER_PAGE;
  } else if (evt.deltaMode === MOUSE_DOM_DELTA_LINE_MODE) {
    delta /= MOUSE_LINES_PER_PAGE;
  }
  return delta;
}

const watchScroll = (
  viewAreaElement: HTMLDivElement,
  callback: (state: WatchScrollStateType) => void,
) => {
  let rAF: number | null = null;

  const debounceScroll = function () {
    if (rAF) {
      return;
    }
    // schedule an invocation of scroll for next animation frame.
    rAF = window.requestAnimationFrame(() => {
      rAF = null;

      const currentX = viewAreaElement.scrollLeft;
      const lastX = state.lastX;
      if (currentX !== lastX) {
        state.right = currentX > lastX;
      }
      state.lastX = currentX;
      const currentY = viewAreaElement.scrollTop;
      const lastY = state.lastY;
      if (currentY !== lastY) {
        state.down = currentY > lastY;
      }
      state.lastY = currentY;
      callback(state);
    });
  };

  const state = {
    right: true,
    down: true,
    lastX: viewAreaElement.scrollLeft,
    lastY: viewAreaElement.scrollTop,
    _eventHandler: debounceScroll,
  };

  viewAreaElement.addEventListener('scroll', debounceScroll, true);
  return state;
};

const applyTransform = (p: number[], m: number[]) => {
  const xt = p[0] * m[0] + p[1] * m[2] + m[4];
  const yt = p[0] * m[1] + p[1] * m[3] + m[5];
  return [xt, yt];
};

const applyInverseTransform = (p: number[], m: number[]) => {
  const d = m[0] * m[3] - m[1] * m[2];
  const xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
  const yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
  return [xt, yt];
};

function isSameScale(oldScale: number, newScale: number) {
  if (newScale === oldScale) {
    return true;
  }
  if (Math.abs(newScale - oldScale) < 1e-15) {
    return true;
  }
  return false;
}

export {
  getVisibleElements,
  scrollIntoView,
  scrollIntoViewWithContainer,
  normalizeWheelEventDelta,
  watchScroll,
  applyTransform,
  applyInverseTransform,
  isSameScale,
};
