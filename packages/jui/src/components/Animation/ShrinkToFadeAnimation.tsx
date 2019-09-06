import styled, {
  keyframes,
  css,
  InterpolationValue,
  FlattenInterpolation,
} from 'styled-components';
import tinycolor from 'tinycolor2';
import React, { RefObject, useRef, useEffect } from 'react';
import { primary, palette } from '../../foundation/utils';
import { ShrinkToFadeAnimationProps } from './types';

type AnimationContainerProps = {
  startMinimizeAnimation: boolean;
  inProps?: boolean;
  fadeInAnimation?: () => InterpolationValue[];
  fadeOutAnimation?: () => InterpolationValue[];
  roundAnimation?: () => FlattenInterpolation<any>[];
  transFormOrigin?: () => InterpolationValue[];
  blinkAnimation?: () => InterpolationValue[];
  moveAnimation?: () => InterpolationValue[];
};

const makeSeconds = (val: number) => `${val}s`;
const secondsToNumber = (val: string) => +val.replace('s', '');

const ANIMATION_END_EVT = 'animationend';
const SHADOW_SIZE = '20px';
const EXPAND_SCALE = 1.4;
const FADE_DURATION = makeSeconds(0.5);
const MOVE_DURATION = FADE_DURATION;
const ROUND_DURATION = makeSeconds(0.6);
const BLINK_DURATION = makeSeconds(0.4);
const FADE_IN_DURATION = makeSeconds(0.25);
const MOVE_DELAY = makeSeconds(
  secondsToNumber(ROUND_DURATION) - secondsToNumber(MOVE_DURATION),
);
const BLINK_DELAY = ROUND_DURATION;

const DEFAULT_TRANSFORMATION_BEZIER = 'ease-in-out';
const BLINK_TIMING_BEZIER = 'ease-in-out';
const MOVE_TIMING_BEZIER = 'linear';

const ITERATION = 1;
const ANIMATION_DIRECTION = 'normal';
const ANIMATION_FILL_MODE = 'forwards';

function makeAnimationPromise(_domList: RefObject<HTMLDivElement>[]) {
  // listening to animation containers' `animationend` event
  const { promises, cancelPromises } = _domList
    .map(ref => {
      if (ref.current === null) {
        return [];
      }
      const el = ref.current as HTMLElement;
      let cb: (value?: any) => void = () => {};
      const promise: Promise<any> = new Promise(resolve => {
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
        acc.cancelPromises.push(deRegister);
        return acc;
      },
      {
        promises: [],
        cancelPromises: [],
      } as {
        promises: Promise<any>[];
        cancelPromises: (() => void)[];
      },
    );

  return {
    cancelPromises,
    promise: Promise.all(promises),
  };
}

const FadeAnimationContainer = styled.div<AnimationContainerProps>`
  && {
    transform-origin: ${props =>
      props.startMinimizeAnimation ? 'top left' : undefined};
    animation: ${props =>
      props.inProps && !props.startMinimizeAnimation
        ? props.fadeInAnimation
        : props.fadeOutAnimation};
  }
`;

const RoundAnimationContainer = styled.div<AnimationContainerProps>`
  && {
    overflow: hidden;
    position: relative;
    animation: ${props =>
      props.startMinimizeAnimation ? props.roundAnimation : undefined};
    will-change: border-radius, opacity, transform;
  }
`;

const BlinkAnimationContainer = styled.div<AnimationContainerProps>`
  && {
    transform-origin: ${props =>
      props.startMinimizeAnimation ? props.transFormOrigin : undefined};
    animation: ${props =>
      props.startMinimizeAnimation ? props.blinkAnimation : undefined};
  }
`;

const MoveAnimationContainer = styled.div<AnimationContainerProps>`
  && {
    animation: ${props =>
      props.startMinimizeAnimation ? props.moveAnimation : undefined};
  }
`;

const ShrinkToFadeAnimation = ({
  children,
  startMinimizeAnimation,
  xScale, // Horizontal animation scale size
  yScale, // Vertical animation scale size
  translateX, // Horizontal animation destination
  translateY, // Vertical animation destination
  onAnimationEnd,
  setRef,
  removeRef,
  expandScale = EXPAND_SCALE,
  fadeDuration = FADE_DURATION,
  moveDuration = MOVE_DURATION,
  roundDuration = ROUND_DURATION,
  blinkDuration = BLINK_DURATION,
  moveDelay = MOVE_DELAY,
  blinkDelay = BLINK_DELAY,
  in: inProps,
}: ShrinkToFadeAnimationProps) => {
  const _moveContainerRef = useRef(null);
  const _blinkContainerRef = useRef(null);
  const _roundContainerRef = useRef(null);
  const _fadeContainerRef = useRef(null);

  const _domList = [
    _fadeContainerRef,
    _roundContainerRef,
    _blinkContainerRef,
    _moveContainerRef,
  ];

  useEffect(() => {
    const { promise, cancelPromises } = makeAnimationPromise(_domList);
    onAnimationEnd && promise.then(onAnimationEnd);
    setRef && setRef(_moveContainerRef);

    return () => {
      removeRef && removeRef();
      cancelPromises.forEach(cb => {
        cb && cb();
      });
    };
  }, [startMinimizeAnimation]);

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

  const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

  const fadeOut = keyframes`
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
    transform: ${`translate(${translateX}px, ${translateY}px)`};
  }
}
`;

  const blink = keyframes`
  0%{
    transform: scale(1, 1);
    opacity: 1;
  }
  25%{
    transform: ${`scale(${expandScale}, ${expandScale})`};
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

  const fadeOutAnimation = () =>
    css`${fadeOut} ${fadeDuration}  ${DEFAULT_TRANSFORMATION_BEZIER} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

  const fadeInAnimation = () =>
    css`${fadeIn} ${FADE_IN_DURATION}  ${DEFAULT_TRANSFORMATION_BEZIER} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

  const roundAnimation = () =>
    css`${round} ${roundDuration} ${DEFAULT_TRANSFORMATION_BEZIER} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

  const transFormOrigin = () => css`
    ${translateX}px, ${translateY}px
  `;

  const moveAnimation = () =>
    css`${move} ${moveDuration} ${MOVE_TIMING_BEZIER} ${moveDelay} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

  const blinkAnimation = () =>
    css`${blink} ${blinkDuration} ${BLINK_TIMING_BEZIER} ${blinkDelay} ${ITERATION} ${ANIMATION_FILL_MODE} ${ANIMATION_DIRECTION}`;

  return (
    <MoveAnimationContainer
      data-test-automation-id="dialer-move-animation-container"
      ref={_moveContainerRef as any}
      moveAnimation={moveAnimation}
      startMinimizeAnimation={startMinimizeAnimation}
    >
      <BlinkAnimationContainer
        data-test-automation-id="dialer-blink-animation-container"
        ref={_blinkContainerRef as any}
        blinkAnimation={blinkAnimation}
        transFormOrigin={transFormOrigin}
        startMinimizeAnimation={startMinimizeAnimation}
      >
        <RoundAnimationContainer
          data-test-automation-id="dialer-round-animation-container"
          ref={_roundContainerRef as any}
          roundAnimation={roundAnimation}
          startMinimizeAnimation={startMinimizeAnimation}
        >
          <FadeAnimationContainer
            data-test-automation-id="dialer-fade-animation-container"
            ref={_fadeContainerRef as any}
            fadeInAnimation={fadeInAnimation}
            fadeOutAnimation={fadeOutAnimation}
            startMinimizeAnimation={startMinimizeAnimation}
            inProps={inProps}
          >
            {children}
          </FadeAnimationContainer>
        </RoundAnimationContainer>
      </BlinkAnimationContainer>
    </MoveAnimationContainer>
  );
};

export { ShrinkToFadeAnimation };
