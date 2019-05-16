/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-01 15:35:36
 * Copyright © RingCentral. All rights reserved.
 */

// TODO: move this file to JUI
import React, { MouseEvent } from 'react';
import { JuiIconButton } from '../../components/Buttons';
import _ from 'lodash';
import { KEY_2_ICON_MAP, ACCEPTABLE_KEYS } from './constants';

type DialPadViewProps = {
  makeKeyboardEffect: (digit: string) => void;
  makeMouseEffect: (digit: string) => void;
  shouldHandleKeyboardEvts?: boolean;
};

type DialPadViewState = {
  pressedKeys: string[];
};

const KEY_UP = 'keyup';
const KEY_DOWN = 'keydown';

const THROTTLE_TIME = 30;
const throttledHandler = (f: any) =>
  _.debounce(f, THROTTLE_TIME, {
    trailing: true,
    leading: false,
  });

export class DialPad extends React.Component<
  DialPadViewProps,
  DialPadViewState
> {
  static defaultProps = {
    shouldHandleKeyboardEvts: true,
  };

  private static _timeout = 1000;
  // we need `onKeyup` & `onKeydown` to get called in same amount, but also make sure of the performance.
  private _buffer: string[] = [];
  private _timeoutId: NodeJS.Timeout | null = null;
  private _mouseDownTime: number | null = null;
  private _onClicks: ((e?: MouseEvent<HTMLButtonElement>) => void)[]; // only need this to generate once

  constructor(props: DialPadViewProps) {
    super(props);
    this.state = {
      pressedKeys: [],
    };

    this._onClicks = Object.keys(KEY_2_ICON_MAP)
      .filter((key) => key !== 'plus')
      .map((str) => (e) => {
        this.props.makeMouseEffect(KEY_2_ICON_MAP[str]);
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
  }

  componentDidMount() {
    window.addEventListener(KEY_UP, this._onKeyUp);
    window.addEventListener(KEY_DOWN, this._onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener(KEY_UP, this._onKeyUp);
    window.removeEventListener(KEY_DOWN, this._onKeyDown);
    this._clearTimeout();
    delete this._buffer;
    delete this._onClicks;
  }

  makeKeyboardEffect = throttledHandler((key: string, isKeyup: boolean) => {
    if (!ACCEPTABLE_KEYS.includes(key)) {
      return;
    }
    this.setState({
      pressedKeys: this._buffer,
    });
    if (isKeyup) {
      this.props.makeKeyboardEffect(key);
    }
  });

  _onKeyDown = ({ key }: KeyboardEvent) => {
    if (
      !ACCEPTABLE_KEYS.includes(key) ||
      !this.props.shouldHandleKeyboardEvts
    ) {
      return;
    }
    if (!this._buffer.includes(key)) {
      this._buffer = [...this._buffer, key];
      this.makeKeyboardEffect(key, false);
    }
  }

  _onKeyUp = ({ key }: KeyboardEvent) => {
    if (!this.props.shouldHandleKeyboardEvts) {
      return;
    }
    this._buffer = this._buffer.filter((bufferedKey) => bufferedKey !== key);
    this.makeKeyboardEffect(key, true);
  }

  _clearTimeout = () => {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  _onMouseDownForZero = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this._mouseDownTime = +new Date();
    this._timeoutId = setTimeout(() => {
      this.props.makeMouseEffect(KEY_2_ICON_MAP.plus);
      this._clearTimeout();
    },                           DialPad._timeout);
  }

  _onMouseupForZero = throttledHandler((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const curTime = +new Date();
    if (
      this._mouseDownTime &&
      curTime - this._mouseDownTime >= DialPad._timeout
    ) {
      return;
    }

    this._onClicks[10](); // the '10' button is on the 11th
    this._clearTimeout();
    this._mouseDownTime = null;
  });

  render() {
    const { pressedKeys } = this.state;
    return (
      <>
        {Object.keys(KEY_2_ICON_MAP)
          .filter((key) => key !== 'plus')
          .map((str, idx) => {
            const _onclick = this._onClicks[idx];

            if (str !== 'zero') {
              return (
                <JuiIconButton
                  shouldPersistBg={pressedKeys.includes(KEY_2_ICON_MAP[str])}
                  disableToolTip={true}
                  onMouseDown={_onclick}
                  size="xxlarge"
                  key={str}
                  color="grey.900"
                  stretchIcon={true}
                >
                  {str}
                </JuiIconButton>
              );
            }

            return (
              <JuiIconButton
                disableToolTip={true}
                shouldPersistBg={
                  pressedKeys.includes('0') || pressedKeys.includes('+')
                }
                onMouseDown={this._onMouseDownForZero}
                onMouseUp={this._onMouseupForZero}
                size="xxlarge"
                key={str}
                color="grey.900"
                stretchIcon={true}
              >
                {str}
              </JuiIconButton>
            );
          })}
      </>
    );
  }
}
