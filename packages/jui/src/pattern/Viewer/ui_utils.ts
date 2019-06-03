/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
type viewItemType = {
  div: HTMLDivElement;
  id: number;
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

export { getVisibleElements, scrollIntoViewWithContainer };
