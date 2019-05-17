/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { createRef, RefObject } from 'react';
import { observer } from 'mobx-react';
import { JuiDialer, JuiHeaderContainer } from 'jui/pattern/Dialer';
import styled, { keyframes, css } from 'styled-components';
import tinycolor from 'tinycolor2';
import { DialerTitleBar } from '../DialerTitleBar';
import { DialerHeader } from '../DialerHeader';
import { DialerContainer } from '../DialerContainer';
import { DialerViewProps } from './types';
import { withDialogOrNewWindow } from '../../HOC';
import { Incoming } from '../Incoming';
import { CALL_STATE, CALL_WINDOW_STATUS } from '../../FSM';
import { DialerKeypadHeader } from '../DialerKeypadHeader';
import { primary, palette } from 'jui/foundation/utils';
import { Reply } from '../Reply';
import { INCOMING_STATE } from '../../store';

const makeSeconds = (val: number) => `${val}s`;
const secondsToNumber = (val: string) => +val.replace('s', '');

const ANIMATION_END_EVT = 'animationend';
const SHADOW_SIZE = '20px';
const EXPAND_SCALE = 1.4;
const FADE_DURATION = makeSeconds(0.5);
const MOVE_DURATION = FADE_DURATION;
const ROUND_DURATION = makeSeconds(0.6);
const BLINK_DURATION = makeSeconds(0.4);
const MOVE_DELAY = makeSeconds(
  secondsToNumber(ROUND_DURATION) - secondsToNumber(MOVE_DURATION),
);
const BLINK_DELAY = ROUND_DURATION;

const DEFAULT_TRANSFORMATION_BEZIER = 'ease-in-out';
const BLINK_TIMING_BEZIER = 'cubic-bezier(.18,2,0,.62)';
const MOVE_TIMING_BEZIER = 'linear';

const ITERATION = 1;
const ANIMATION_DIRECTION = 'normal';
const ANIMATION_FILL_MODE = 'forwards';

@observer
class DialerViewComponent extends React.Component<DialerViewProps> {
  private _roundContainerRef: RefObject<HTMLDivElement> = createRef();
  private _blinkContainerRef: RefObject<HTMLDivElement> = createRef();
  private _moveContainerRef: RefObject<HTMLDivElement> = createRef();
  private _fadeContainerRef: RefObject<HTMLDivElement> = createRef();

  private _domList = [
    this._fadeContainerRef,
    this._roundContainerRef,
    this._blinkContainerRef,
    this._moveContainerRef,
  ];
  private _deRegisters: (() => void)[] = [];

  private _makeAnimationPromise() {
    // listening to animation containers' `animationend` event
    const { promises, deRegisters } = this._domList
      .map((ref) => {
        if (ref.current === null) {
          return [];
        }
        const el = ref.current as HTMLElement;
        let cb: (value?: any) => void = () => {};
        const promise: Promise<any> = new Promise((resolve) => {
          cb = (e: AnimationEvent) => {
            resolve(e);
            e.stopPropagation();
          };
        });

        const deRegister: () => void = () =>
          el.removeEventListener(ANIMATION_END_EVT, cb);

        el.addEventListener(ANIMATION_END_EVT, cb);
        promise.then(deRegister);

        return [promise, deRegister] as [Promise<any>, () => void];
      })
      .reduce(
        (acc, el) => {
          const [promise, deRegister] = el;
          acc.promises.push(promise);
          acc.deRegisters.push(deRegister);
          return acc;
        },
        {
          promises: [],
          deRegisters: [],
        } as {
          promises: Promise<any>[];
          deRegisters: (() => void)[];
        },
      );

    this.props.setAnimationPromise(Promise.all(promises));
    this._deRegisters = deRegisters;
  }

  private _clearAnimationPromise() {
    this._deRegisters.forEach((cb) => {
      cb && cb();
    });
    this._deRegisters = [];
    this.props.clearAnimationPromise();
  }

  componentDidMount() {
    // listening to animation containers's animationend event
    this._makeAnimationPromise();
  }

  /**
   * FIXME: it's dangerous using sCU in observer component, we need to separate the animation of fade-in-out of the dialog
   * and ball fly animation into different trigger conditions so that they won't interfere each other
   */
  shouldComponentUpdate(nextProps: DialerViewProps) {
    const { callState, callWindowState, incomingState } = nextProps;
    switch (true) {
      case callState === CALL_STATE.INCOMING &&
        this.props.incomingState === INCOMING_STATE.REPLY &&
        incomingState === INCOMING_STATE.REPLY:
        return false;
      case callState === CALL_STATE.IDLE &&
        this.props.callState === CALL_STATE.IDLE:
        return false;
      case callWindowState === CALL_WINDOW_STATUS.MINIMIZED:
        return false;
      default:
        return true;
    }
  }

  componentWillUpdate() {
    this._clearAnimationPromise();
  }

  componentDidUpdate() {
    // listening to animation containers's animationend event
    this._makeAnimationPromise();
    const { shouldAnimationStart } = this.props;
    const el = this._moveContainerRef && this._moveContainerRef.current;
    if (shouldAnimationStart && el !== null) {
      const dialog = el.parentElement as HTMLElement;
      const draggable = dialog.parentElement as HTMLElement;
      dialog.style.overflow = 'visible';
      draggable.style.overflow = 'visible';
    }
  }

  componentWillUnmount() {
    this._clearAnimationPromise();
    this._domList = [];
  }

  render() {
    const {
      callState,
      dialerId,
      keypadEntered,
      shouldAnimationStart,
      dialerMinimizeTranslateX,
      dialerMinimizeTranslateY,
      xScale,
      yScale,
      incomingState,
      onDialerFocus,
      onDialerBlur,
    } = this.props;

    const round = ({ theme }: any) => keyframes`
      0% {
        border-radius: 0;
        background-color: ${tinycolor(primary('600')({ theme }))
          .setAlpha(0)
          .toRgbString()};
        box-shadow: outset ${palette('common', 'black', 0.2)({
          theme,
        })} 0px 0px ${SHADOW_SIZE};
      }

      16.6666% {
        background-color: ${tinycolor(primary('600')({ theme }))
          .setAlpha(0.01)
          .toRgbString()};
        border-radius: 0;
        box-shadow: inset ${palette('common', 'black', 0.2)({
          theme,
        })} 0px 0px ${SHADOW_SIZE};
      }

      33.3333% {
        background-color: ${tinycolor(primary('600')({ theme }))
          .setAlpha(0.1)
          .toRgbString()};
        border-radius: 20%;
        box-shadow: inset ${palette('common', 'black', 0.2)({
          theme,
        })} 0px 0px ${SHADOW_SIZE};
      }

      50% {
        border-radius: 40%;
        background-color: ${tinycolor(primary('600')({ theme }))
          .setAlpha(0.3)
          .toRgbString()};
        box-shadow: inset ${palette('common', 'black', 0.2)({
          theme,
        })} 0px 0px ${SHADOW_SIZE};
      }

      66.66666666666666% {
        border-radius: 60%;
        transform: ${`scale(${xScale}, ${yScale})`};
        background-color:${tinycolor(primary('600')({ theme }))
          .setAlpha(0.4)
          .toRgbString()};
      }

      83.333333% {
        border-radius: 80%;
        transform: ${`scale(${xScale}, ${yScale})`};
        background-color:${tinycolor(primary('600')({ theme }))
          .setAlpha(0.4)
          .toRgbString()};
      }

      100% {
        border-radius: 100%;
        transform: ${`scale(${xScale}, ${yScale})`};
        background-color: ${tinycolor(primary('600')({ theme }))
          .setAlpha(0.6)
          .toRgbString()};
      }
    `;

    const fade = keyframes`
      0% {
        opacity: 1;
        transform: translate(0%, 0%)
      }

      60% {
        opacity: 0.1;
      }

      80% {
        opacity: 0;
        transform: translate(100%, 100%)
      }

      100% {
        opacity: 0;
      }
    `;

    const move = keyframes`
    {
      0% {
        transform: translate(0%, 0%)
      }

      100% {
        transform: ${`translate(${dialerMinimizeTranslateX}px, ${dialerMinimizeTranslateY}px)`};
      }
    }
    `;

    const blink = keyframes`
      0%{
        transform: scale(1, 1);
        opacity: 1;
      }
      25%{
        transform: ${`scale(${EXPAND_SCALE}, ${EXPAND_SCALE})`};
        opacity: 0.3;
      }
      50%{
        transform: scale(0, 0);
        opacity: 0;
      }
      100%{
        transform: scale(0, 0);
        opacity: 0;
      }
    `;

    const fadeAnimation = () =>
      css`${fade} ${FADE_DURATION} ${DEFAULT_TRANSFORMATION_BEZIER} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

    const roundAnimation = () =>
      css`${round} ${ROUND_DURATION} ${DEFAULT_TRANSFORMATION_BEZIER} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

    const transFormOrigin = () =>
      css`
        ${dialerMinimizeTranslateX}px, ${dialerMinimizeTranslateY}px
      `;

    const moveAnimation = () =>
      css`${move} ${MOVE_DURATION} ${MOVE_TIMING_BEZIER} ${MOVE_DELAY} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

    const blinkAnimation = () =>
      css`${blink} ${BLINK_DURATION} ${BLINK_TIMING_BEZIER} ${BLINK_DELAY} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

    const DialerFadeAnimationContainer = styled.div`
      && {
        transform-origin: top left;
        animation: ${shouldAnimationStart ? fadeAnimation : undefined};
      }
    `;

    const DialerRoundAnimationContainer = styled.div`
      && {
        overflow: hidden;
        position: relative;
        animation: ${shouldAnimationStart ? roundAnimation : undefined};
        will-change: border-radius, opacity, transform;
      }
    `;

    const DialerBlinkAnimationContainer = styled.div`
      && {
        transform-origin: ${shouldAnimationStart ? transFormOrigin : undefined};
        animation: ${shouldAnimationStart ? blinkAnimation : undefined};
      }
    `;

    const DialerMoveAnimationContainer = styled.div`
      && {
        animation: ${shouldAnimationStart ? moveAnimation : undefined};
      }
    `;

    return (
      <DialerMoveAnimationContainer
        data-test-automation-id="dialer-move-animation-container"
        ref={this._moveContainerRef as any}
        id={dialerId}
      >
        <DialerBlinkAnimationContainer
          data-test-automation-id="dialer-blink-animation-container"
          ref={this._blinkContainerRef as any}
        >
          <DialerRoundAnimationContainer
            data-test-automation-id="dialer-round-animation-container"
            ref={this._roundContainerRef as any}
          >
            <DialerFadeAnimationContainer
              data-test-automation-id="dialer-fade-animation-container"
              ref={this._fadeContainerRef as any}
            >
              <JuiDialer onFocus={onDialerFocus} onBlur={onDialerBlur}>
                {callState === CALL_STATE.INCOMING &&
                  (incomingState === INCOMING_STATE.REPLY ? (
                    <Reply />
                  ) : (
                    <Incoming />
                  ))}
                {// Dialer view here
                callState !== CALL_STATE.INCOMING && (
                  <>
                    <JuiHeaderContainer>
                      <DialerTitleBar />
                      {keypadEntered ? (
                        <DialerKeypadHeader />
                      ) : (
                        <DialerHeader />
                      )}
                    </JuiHeaderContainer>
                    <DialerContainer />
                  </>
                )}
              </JuiDialer>
            </DialerFadeAnimationContainer>
          </DialerRoundAnimationContainer>
        </DialerBlinkAnimationContainer>
      </DialerMoveAnimationContainer>
    );
  }
}

const DialerView = withDialogOrNewWindow(DialerViewComponent);

export { DialerView };
