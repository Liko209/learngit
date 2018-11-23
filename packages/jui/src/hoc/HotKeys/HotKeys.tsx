/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:49:51
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import * as Mousetrap from 'mousetrap';

type ChildrenProps = {
  unbind: MousetrapStatic['unbind'];
  reset: MousetrapStatic['reset'];
};

type HotKeysProps = {
  children(props: ChildrenProps): JSX.Element;
  keyMap: {
    [index: string]: (e: KeyboardEvent, combo: string) => void | boolean;
  };
};

class HotKeys extends Component<HotKeysProps, {}> {
  componentDidMount() {
    const { keyMap } = this.props;

    Object.keys(keyMap).forEach((key: string) => {
      Mousetrap.bind(key, keyMap[key]);
    });
  }

  componentWillUnmount() {
    const { keyMap } = this.props;

    Object.keys(keyMap).forEach((key: string) => {
      Mousetrap.unbind(key);
    });
  }

  render() {
    const renderedChildren = this.props.children({
      unbind: Mousetrap.unbind,
      reset: Mousetrap.reset,
    });
    return renderedChildren && React.Children.only(renderedChildren);
  }
}

export { HotKeys, HotKeysProps };
