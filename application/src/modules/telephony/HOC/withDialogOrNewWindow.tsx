/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 18:23:34
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType, ComponentClass } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import { JuiDraggableDialog } from 'jui/components/Dialog';
import { container } from 'framework';
import { TelephonyStore } from '../store';
import { TelephonyService } from '../service';
import { CALL_WINDOW_STATUS } from '../FSM';
import { JuiZoomInFadeOut } from 'jui/components/Animation';
import { TELEPHONY_SERVICE } from '../interface/constant';

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
  @observer
  class ComponentWithDialogOrNewWindow extends React.Component<T> {
    private _window: Window | null = null;
    private _div = document.createElement('div');
    private _root = document.body;
    private _dragRef = React.createRef<any>();
    private _handleResize = () => {};

    private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    private _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );

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
    }

    private _backdrop = this._createBackdrop();

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
    }

    private _closeWindow = () => {
      if (this._window) {
        this._window.close();
      }
    }

    private _handleStart = () => {
      document.body.appendChild(this._backdrop);
    }

    private _handleStop = () => {
      document.body.removeChild(this._backdrop);
    }

    componentDidUpdate() {
      setTimeout(() => {
        if (this._dragRef.current) {
          const dragEl = ReactDOM.findDOMNode(this._dragRef.current) as Element;
          this._handleResize = () => {
            requestAnimationFrame(() => {
              dragEl.dispatchEvent(MOUSE_EVENT.DOWN);
              dragEl.dispatchEvent(MOUSE_EVENT.MOVE);
              dragEl.dispatchEvent(MOUSE_EVENT.UP);
            });
          };
          window.addEventListener('resize', this._handleResize);
        } else {
          window.removeEventListener('resize', this._handleResize);
        }
      },         300);
    }

    render() {
      const { callWindowState } = this._telephonyStore;
      const open =
        callWindowState === CALL_WINDOW_STATUS.MINIMIZED ? false : true;
      let container = this._root;
      if (callWindowState === CALL_WINDOW_STATUS.DETACHED) {
        container = this._div;
        this._createWindow();
      } else {
        this._closeWindow();
      }

      return (
        <JuiDraggableDialog
          container={container}
          open={open}
          x={(document.body.clientWidth - 344) / 2}
          y={(document.body.clientHeight - 504) / 2}
          dragRef={this._dragRef}
          TransitionComponent={JuiZoomInFadeOut}
          onStart={this._handleStart}
          onStop={this._handleStop}
        >
          <Component {...this.props} />
        </JuiDraggableDialog>
      );
    }
  }
  return ComponentWithDialogOrNewWindow;
}

export { withDialogOrNewWindow };
