/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-26 17:22:09
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiListItemIcon, JuiListItemIconProps } from '../../components/Lists';
import { palette } from '../../foundation/utils';

const JuiLeftRail = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${palette('grey', '100')};
`;

const JuiLeftRailStickyTop = styled.div``;

const JuiLeftRailMainSection = styled.div`
  flex: 1;
  overflow: auto;
`;

type JuiLeftRailListItemIconProps = JuiListItemIconProps & {
  disabled?: boolean;
};

const JuiLeftRailListItemIconWrapper = ({
  disabled,
  ...rest
}: JuiLeftRailListItemIconProps) => <JuiListItemIcon {...rest} />;

const JuiLeftRailListItemIcon = styled(JuiLeftRailListItemIconWrapper)`
  opacity: ${({ disabled, theme }) =>
    disabled ? theme.palette.action.hoverOpacity * 3 : 1};
`;

export {
  JuiLeftRail,
  JuiLeftRailStickyTop,
  JuiLeftRailMainSection,
  JuiLeftRailListItemIcon,
};
export default JuiLeftRail;
