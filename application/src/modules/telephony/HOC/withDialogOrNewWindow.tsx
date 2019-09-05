/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 18:23:34
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType, ComponentClass } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import { JuiDraggableDialog } from 'jui/components/Dialog';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../store';
import { TelephonyService } from '../service';
import { CALL_WINDOW_STATUS } from '../FSM';
import {
  JuiZoomProps,
  ShrinkToFadeAnimation,
  ShrinkToFadeAnimationProps,
} from 'jui/components/Animation';
import { TELEPHONY_SERVICE } from '../interface/constant';

const FOCUS_IN_EVT = 'focusin';
const BLUR = 'blur';
const SYNC_DIALER_ENTERED = 300;
const RESIZE = 'resize';

const getDefaultPos = () => ({
  x: Math.floor((document.body.clientWidth - 344) / 2),
  y: Math.floor((document.body.clientHeight - 552) / 2),
});

/*eslint-disable*/
function copyStyles(sourceDoc: Document, targetDoc: Document) {
  Array.from(sourceDoc.styleSheets).forEach((styleSheet: CSSStyleSheet) => {
    if (styleSheet.cssRules) {
      // true for inline styles
      const newStyleEl = sourceDoc.createElement('style');

      Array.from(styleSheet.cssRules).forEach((cssRule: CSSRule) => {
        newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) {
      // true for stylesheets loaded from a URL
      const newLinkEl = sourceDoc.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}

function createMouseEvent(type: string) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
  });
}

const MOUSE_EVENT = {
  DOWN: createMouseEvent('mousedown'),
  UP: createMouseEvent('mouseup'),
  MOVE: createMouseEvent('mousemove'),
};

function withDialogOrNewWindow<T>(
  Component: ComponentType<T>,
): ComponentClass<T> {
  type AnimationProps = ShrinkToFadeAnimationProps & JuiZoomProps;
  const RADIUS = 32;

  @observer
  class DialerTransitionComponent extends React.Component<AnimationProps> {
    private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    private _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );

    render() {
      const {
        dialerMinimizeTranslateX,
        dialerMinimizeTranslateY,
        startMinimizeAnimation,
        dialerHeight,
        dialerWidth,
      } = this._telephonyStore;
      const { onAnimationEnd } = this._telephonyService;

      return (
        <ShrinkToFadeAnimation
          xScale={`${RADIUS / dialerWidth}`}
          yScale={`${RADIUS / dialerHeight}`}
          translateX={dialerMinimizeTranslateX}
          translateY={dialerMinimizeTranslateY}
          onAnimationEnd={onAnimationEnd}
          startMinimizeAnimation={startMinimizeAnimation}
          {...this.props}
        />
      );
    }
  }

  @observer
  class ComponentWithDialogOrNewWindow extends React.Component<T> {
    private _goToTop = false;
    private _window: Window | null = null;
    private _div = document.createElement('div');
    private _root = document.body;
    private _dragRef = React.createRef<any>();
    private _containerRef = React.createRef<any>();
    private _timerId: NodeJS.Timeout;
    private _handleResize = () => {};
    private _timer: NodeJS.Timeout;
    private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    private _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );

    state = {
      controlledPosition: {
        x: getDefaultPos().x,
        y: getDefaultPos().y,
      },
    };

    private _createBackdrop = () => {
      const backdrop = document.createElement('div');
      backdrop.style.cssText = `
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        position: fixed;
        z-index: 999;
      `;

      return backdrop;
    };

    private _backdrop = this._createBackdrop();

    private _backToDefaultPos = () => {
      const {
        changeBackToDefaultPos,
        isBackToDefaultPos,
      } = this._telephonyStore;
      const { x, y } = getDefaultPos();

      this.setState({ controlledPosition: { x, y } }, () => {
        isBackToDefaultPos && changeBackToDefaultPos(false);
      });
    };

    private _createWindow = () => {
      if (this._window == null || this._window.closed) {
        this._window = window.open(
          '',
          'Call',
          'width=280,height=440,centerscreen,dialog',
        );
      }
      if (this._window) {
        copyStyles(document, this._window.document);
        this._window.addEventListener('beforeunload', () => {
          this._telephonyService.minimize();
        });
        this._window.document.body.appendChild(this._div);
      }
    };

    private _closeWindow = () => {
      if (this._window) {
        this._window.close();
      }
    };

    private _handleEntered = () => {
      setTimeout(
        () => this._telephonyStore.syncDialerEntered(true),
        SYNC_DIALER_ENTERED,
      );
    };

    private _handleExited = () => {
      this._telephonyStore.syncDialerEntered(false);
    };

    private _handleStart = () => {
      document.body.appendChild(this._backdrop);
    };

    private _handleDrag = (e: DraggableEvent, position: DraggableData) => {
      const { x, y } = position;
      this.setState({ controlledPosition: { x, y } });
    };

    private _handleStop = () => {
      document.body.removeChild(this._backdrop);
    };

    private _onFocus = (e: FocusEvent) => {
      const el = ReactDOM.findDOMNode(this._containerRef.current);

      if (!el) {
        return;
      }
      if (e.target && (el as HTMLDivElement).contains(e.target as Element)) {
        this._telephonyStore.onDialerFocus();
        return;
      }
      this._telephonyStore.onDialerBlur();
    };

    private _onBlur = (e: FocusEvent) => {
      const el = ReactDOM.findDOMNode(this._containerRef.current);

      if (!el) {
        return;
      }
      if (
        e.target &&
        (e.target === window ||
          (el as HTMLDivElement).contains(e.target as Element))
      ) {
        this._telephonyStore.onDialerBlur();
        return;
      }
    };

    componentWillUpdate() {
      const { isBackToDefaultPos, callWindowState, ids } = this._telephonyStore;
      const open =
        callWindowState === CALL_WINDOW_STATUS.MINIMIZED ? false : true;

      const { x: defaultX, y: defaultY } = getDefaultPos();

      const isPosChange =
        this.state.controlledPosition.x !== defaultX ||
        this.state.controlledPosition.y !== defaultY;

      // Init state and Avoid animation when closed
      if (!open && ids.length === 0 && isPosChange) {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
          this._backToDefaultPos();
        }, 200);
        return;
      }

      if (isBackToDefaultPos && isPosChange) {
        this._backToDefaultPos();
      }
    }

    componentDidUpdate() {
      const { startMinimizeAnimation } = this._telephonyStore;

      const dragEl = ReactDOM.findDOMNode(
        this._dragRef.current,
      ) as HTMLDivElement;

      // since it involves high order component <FadeInOut/>, the dragEl will be null in the first run.
      if (dragEl) {
        if (startMinimizeAnimation) {
          dragEl.style.overflow = 'visible';
          (dragEl.children[0] as HTMLDivElement).style.overflow = 'visible';
          return;
        }

        dragEl.style.overflow = '';
        (dragEl.children[0] as HTMLDivElement).style.overflow = '';
      }

      window.removeEventListener(RESIZE, this._handleResize);
      clearTimeout(this._timerId);

      this._timerId = setTimeout(() => {
        if (this._dragRef.current) {
          const dragEl = ReactDOM.findDOMNode(this._dragRef.current) as Element;
          this._handleResize = () => {
            requestAnimationFrame(() => {
              dragEl.dispatchEvent(MOUSE_EVENT.DOWN);
              dragEl.dispatchEvent(MOUSE_EVENT.MOVE);
              dragEl.dispatchEvent(MOUSE_EVENT.UP);
            });
          };
          window.addEventListener(RESIZE, this._handleResize);
        }
      }, 300);
    }

    componentWillUnmount() {
      this._telephonyStore.onDialerBlur();
      window.removeEventListener(FOCUS_IN_EVT, this._onFocus);
      window.removeEventListener(BLUR, this._onBlur);
      window.removeEventListener(RESIZE, this._handleResize);
      clearTimeout(this._timer);
    }

    componentDidMount() {
      window.addEventListener(FOCUS_IN_EVT, this._onFocus);
      window.addEventListener(BLUR, this._onBlur);
    }

    render() {
      const { callWindowState, isIncomingCall } = this._telephonyStore;
      const open =
        callWindowState === CALL_WINDOW_STATUS.MINIMIZED ? false : true;
      let container = this._root;
      if (callWindowState === CALL_WINDOW_STATUS.DETACHED) {
        container = this._div;
        this._createWindow();
      } else {
        this._closeWindow();
      }

      const { controlledPosition } = this.state;

      this._goToTop = open
        ? this._goToTop
          ? true
          : isIncomingCall
          ? true
          : false
        : false;

      return (
        <JuiDraggableDialog
          container={container}
          position={controlledPosition}
          open={open}
          dragRef={this._dragRef}
          TransitionComponent={DialerTransitionComponent}
          onStart={this._handleStart}
          onStop={this._handleStop}
          handlerDrag={this._handleDrag}
          ref={this._containerRef}
          onEntered={this._handleEntered}
          onExited={this._handleExited}
          role="dialer"
          goToTop={this._goToTop}
          forceToTop={isIncomingCall}
          keepMounted
        >
          <Component {...this.props} />
        </JuiDraggableDialog>
      );
    }
  }
  return ComponentWithDialogOrNewWindow;
}

export { withDialogOrNewWindow, getDefaultPos };
