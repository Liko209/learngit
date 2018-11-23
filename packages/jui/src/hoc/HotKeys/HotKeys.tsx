/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:49:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import Mousetrap from 'mousetrap';

type ChildrenProps = {
  unbind: MousetrapInstance['unbind'];
  reset: MousetrapInstance['reset'];
  trigger: MousetrapInstance['trigger'];
};

type keyMapValue =
  | ((e: KeyboardEvent, combo: string) => void | boolean)
  | {
    handler: (e: KeyboardEvent, combo: string) => void | boolean;
    action: string;
  };

type HotKeysProps = {
  el?: Element;
  children(props: ChildrenProps): JSX.Element;
  keyMap: {
    [key: string]: keyMapValue;
  };
};

class HotKeys extends Component<HotKeysProps, {}> {
  private _mousetrap: MousetrapInstance;
  constructor(props: HotKeysProps) {
    super(props);
    this._mousetrap = new Mousetrap(props.el ? props.el : document.body);
  }

  componentDidMount() {
    const { keyMap } = this.props;
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
  }

  unbind = (keys: string | string[], action = undefined) => {
    this._mousetrap.unbind(keys, action);
  }

  trigger = (key: string, action = undefined) => {
    this._mousetrap.trigger(key, action);
  }

  render() {
    const renderedChildren = this.props.children({
      unbind: this.unbind,
      reset: this.reset,
      trigger: this.trigger,
    });
    return renderedChildren && React.Children.only(renderedChildren);
  }
}

export { HotKeys, HotKeysProps };
