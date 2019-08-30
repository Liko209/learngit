/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-08-12 11:53:38
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation/log';

const logger = mainLogger.tags('[FIJI-7739]');
const THROTTLE = 100;
const INTERACTION_FILTER_TIME = 3000;

//
// A hack to fix FIJI-7739 scroll bar issue
//
// If there is a wheel event but not scroll event, the user might be stuck in the issue.
// When this happened, we try to modify scrollTop to make the scroll bar work again.
//
class CanNotScrollFixer {
  private _timeout: number;
  //
  // The prev up/down time is to skip the case
  // that caused by FIJI-8218
  //
  private _prevUpTime: number;
  private _prevDownTime: number;

  handleWheel = (event: React.WheelEvent<HTMLElement>) => {
    const scrollParent = event.currentTarget;
    const deltaY = event.deltaY;
    const oldScrollTop = scrollParent.scrollTop;

    if (deltaY < 0) {
      this._prevUpTime = Date.now();
    } else if (deltaY > 0) {
      this._prevDownTime = Date.now();
    }

    clearTimeout(this._timeout);
    this._timeout = window.setTimeout(
      () => this._detectAndFix(scrollParent, deltaY, oldScrollTop),
      THROTTLE,
    );
  };

  handleScroll = () => {
    clearTimeout(this._timeout);
  };

  private _detectAndFix(
    scrollParent: HTMLElement,
    deltaY: number,
    oldScrollTop: number,
  ) {
    if (this._isIssueHappened(scrollParent, deltaY, oldScrollTop)) {
      logger.log('Left rail jump back as it scrolls down');
      const currentScrollTop = scrollParent.scrollTop;
      scrollParent.scrollTop = currentScrollTop + 1;
      window.requestAnimationFrame(() => {
        scrollParent.scrollTop = currentScrollTop;
      });
    }
  }

  private _isIssueHappened(
    scrollParent: HTMLElement,
    deltaY: number,
    oldScrollTop: number,
  ) {
    const upwards = deltaY < 0;
    const downwards = deltaY > 0;
    const minScrollTop = 0;
    const maxScrollTop = scrollParent.scrollHeight - scrollParent.clientHeight;
    const newScrollTop = scrollParent.scrollTop;
    const scrollTopNotChanged = oldScrollTop === newScrollTop;

    return (
      scrollTopNotChanged &&
      ((upwards &&
        newScrollTop !== minScrollTop &&
        Date.now() - this._prevDownTime > INTERACTION_FILTER_TIME) ||
        (downwards &&
          newScrollTop !== maxScrollTop &&
          Date.now() - this._prevUpTime > INTERACTION_FILTER_TIME))
    );
  }
}

export { CanNotScrollFixer };
