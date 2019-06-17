/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-30 21:33:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiContainer, ContactSearchContainer } from 'jui/pattern/Dialer';
import { RuiTooltipProps, RuiTooltip } from 'rcui/components/Tooltip';
import { ContactSearchList } from '../../ContactSearchList';
import { isEqual } from 'lodash';
import {
  CallerIdSelectorProps,
  CallerIdSelector,
} from '../../CallerIdSelector';

type Props = {
  callerIdProps: CallerIdSelectorProps;
  tooltipProps: Pick<
    RuiTooltipProps,
    Exclude<keyof RuiTooltipProps, 'children'>
  >;
};

export const ContactSearchPanel = React.memo((props: Props) => {
  const keypadActions = (
    <ContactSearchContainer>
      <RuiTooltip placement="bottom" {...props.tooltipProps}>
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
