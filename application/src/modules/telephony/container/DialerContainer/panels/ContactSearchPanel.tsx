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
  ContactSearchContainer,
} from 'jui/pattern/Dialer';
import { RuiTooltipProps, RuiTooltip } from 'rcui/components/Tooltip';
import { ContactSearchList } from '../../ContactSearchList';
import { isEqual } from 'lodash';

type Props = {
  callerIdProps: CallerIdSelectorProps;
  tooltipProps: Partial<RuiTooltipProps>;
};

export const ContactSearchPanel = React.memo((props: Props) => {
  const { title, open, tooltipForceHide } = props.tooltipProps;

  const keypadActions = (
    <ContactSearchContainer>
      <RuiTooltip
        title={title}
        placement="bottom"
        open={open}
        tooltipForceHide={tooltipForceHide}
      >
        <CallerIdSelector {...props.callerIdProps} />
      </RuiTooltip>
      <ContactSearchList />
    </ContactSearchContainer>
  );

  return (
    <JuiContainer
      KeypadActions={keypadActions}
      removePadding={true}
      keypadFullSize={true}
    />
  );
},                                           isEqual);
