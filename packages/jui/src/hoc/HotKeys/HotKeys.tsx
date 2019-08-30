/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:49:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import Mousetrap from 'mousetrap';

type ChildrenProps = {
  unbind: MousetrapInstance['unbind'];
  reset: MousetrapInstance['reset'];
  trigger: MousetrapInstance['trigger'];
};

type KeyMapValue =
  | ((
      e: KeyboardEvent,
      combo: string,
    ) => (void | boolean) | Promise<void | boolean>)
  | {
      handler: (
        e: KeyboardEvent,
        combo: string,
      ) => (void | boolean) | Promise<void | boolean>;
      action: string;
    };

type HotKeysProps = {
  global?: boolean;
  direction?: 'column' | 'row';
  customStyle?: React.CSSProperties;
  children?: React.ReactNode | ((props: ChildrenProps) => React.ReactNode);
  keyMap: {
    [key: string]: KeyMapValue;
  };
};

class HotKeys extends PureComponent<HotKeysProps, {}> {
  private _mousetrap: MousetrapInstance;
  private _el: React.RefObject<HTMLDivElement>;
  constructor(props: HotKeysProps) {
    super(props);
    this._el = React.createRef();
  }

  componentDidMount() {
    const { keyMap, global } = this.props;
    if (!global && this._el.current) {
      this._mousetrap = new Mousetrap(this._el.current);
      this._el.current.focus(); // ensure div has focus
    } else {
      this._mousetrap = new Mousetrap(document.body);
    }

    Object.keys(keyMap).forEach((key: string) => {
      const value = keyMap[key];
      if (typeof value === 'object') {
        this._mousetrap.bind(key, value.handler, value.action);
      } else {
        this._mousetrap.bind(key, value);
      }
    });
  }

  componentWillUnmount() {
    const { keyMap } = this.props;
    Object.keys(keyMap).forEach((key: string) => {
      const value = keyMap[key];
      if (typeof value === 'object') {
        this._mousetrap.unbind(key, value.action);
      } else {
        this._mousetrap.unbind(key);
      }
    });
  }

  reset = () => {
    this._mousetrap.reset();
  };

  unbind = (keys: string | string[], action = undefined) => {
    this._mousetrap.unbind(keys, action);
  };

  trigger = (key: string, action = undefined) => {
    this._mousetrap.trigger(key, action);
  };

  get style(): React.CSSProperties {
    const { customStyle } = this.props;
    const base = {
      outline: 0,
    };
    if (customStyle) {
      return {
        ...base,
        ...customStyle,
      };
    }

    return {
      ...base,
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
    } as React.CSSProperties;
  }

  render() {
    const { children, global } = this.props;
    if (children instanceof Function) {
      return children({
        unbind: this.unbind,
        reset: this.reset,
        trigger: this.trigger,
      });
    }

    return global ? (
      children
    ) : (
      <div ref={this._el} tabIndex={-1} style={this.style}>
        {children}
      </div>
    );
  }
}

export { HotKeys, HotKeysProps };
