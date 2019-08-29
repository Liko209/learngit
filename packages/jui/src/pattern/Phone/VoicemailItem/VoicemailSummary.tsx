/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 19:20:58
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import tinycolor from 'tinycolor2';
import { height, palette, opacity, grey } from '../../../foundation/utils';
import styled from '../../../foundation/styled-components';
import {
  JuiExpansionPanelSummary,
  JuiExpansionPanelSummaryProps,
} from 'rcui/components/ExpansionPanel';

type VoicemailSummaryProps = {
  isUnread: boolean;
} & JuiExpansionPanelSummaryProps;

const Wrapper = ({ isUnread, ...rest }: VoicemailSummaryProps) => (
  <JuiExpansionPanelSummary {...rest} />
);

const StyleVoicemailSummary = styled<VoicemailSummaryProps>(Wrapper)`
  && {
    min-height: ${height(16)};
    box-sizing: border-box;
    &.focused {
      border: 1px dashed ${palette('primary', 'main')};
      background-color: transparent;
    }
    &:hover {
      background-color: ${({ isUnread, theme }) =>
        isUnread
          ? tinycolor(palette('primary', 'main')({ theme }))
              .setAlpha(opacity('05')({ theme }))
              .toRgbString()
          : tinycolor(grey('900')({ theme }))
              .setAlpha(opacity('05')({ theme }))
              .toRgbString()};
    }
    &:active {
      background-color: ${({ isUnread, theme }) =>
        isUnread
          ? tinycolor(palette('primary', 'main')({ theme }))
              .setAlpha(opacity('1')({ theme }))
              .toRgbString()
          : tinycolor(grey('900')({ theme }))
              .setAlpha(opacity('1')({ theme }))
              .toRgbString()};
    }
  }
`;

const VoicemailSummary = (props: VoicemailSummaryProps) => {
  const { isUnread, ...rest } = props;
  return <StyleVoicemailSummary isUnread={isUnread} {...rest} />;
};

VoicemailSummary.muiName = 'ExpansionPanelSummary';
export { VoicemailSummary };
