/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 21:33:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  CallerIdSelectorProps,
  CallerIdSelector,
  JuiContainer,
  DialPad,
} from 'jui/pattern/Dialer';
import { RuiTooltipProps, RuiTooltip } from 'rcui/components/Tooltip';
import { DialBtn } from '../../DialBtn';
import { ForwardBtn } from '../../Forward/ForwardBtn';
import { DialerContainerViewProps } from '../types';
import { isEqual } from 'lodash';

type Props = {
  callerIdProps: CallerIdSelectorProps;
  tooltipProps: Pick<
    RuiTooltipProps,
    Exclude<keyof RuiTooltipProps, 'children'>
  >;
} & Partial<DialerContainerViewProps>;

const emptyFunc = () => {};

export const DialerPanel = React.memo((props: Props) => {
  const {
    clickToInput = emptyFunc,
    playAudio = emptyFunc,
    dialerInputFocused,
    isForward,
  } = props;

  const callAction = isForward ? ForwardBtn : DialBtn;

  const keypadActions = (
    <>
      <RuiTooltip placement="bottom" {...props.tooltipProps}>
        <CallerIdSelector {...props.callerIdProps} />
      </RuiTooltip>
      <DialPad
        makeMouseEffect={clickToInput}
        makeKeyboardEffect={playAudio}
        shouldHandleKeyboardEvts={dialerInputFocused}
      />
    </>
  );
  return <JuiContainer CallAction={callAction} KeypadActions={keypadActions} />;
},                                    isEqual);
