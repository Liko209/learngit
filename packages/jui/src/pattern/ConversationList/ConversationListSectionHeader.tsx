/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:57
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import { ConversationListItemText as ItemText } from './ConversationListItemText';
import {
  JuiListNavItem,
  JuiListNavItemIconographyLeft,
  JuiListNavItemIconography,
} from './../../components';

const StyledRightWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
`;

type JuiSectionHeaderProps = {
  title: string;
  icon: string;
  umi?: JSX.Element;
  expanded?: boolean;
  className?: string;
  hideArrow?: boolean;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => any;
  onArrowClick?: (e: React.MouseEvent) => any;
};

const JuiConversationListSectionHeader = memo(
  (props: JuiSectionHeaderProps) => {
    const {
      icon,
      title,
      umi,
      expanded,
      className,
      hideArrow,
      onClick,
      onArrowClick,
      selected,
      ...rest
    } = props;

    const arrow = expanded ? 'arrow_up' : 'arrow_down';

    return (
      <JuiListNavItem
        className={className}
        data-test-automation-id="conversation-list-section-header"
        button={true}
        selected={selected}
        classes={{ selected: 'selected' }}
        onClick={onClick}
        {...rest}
      >
        <JuiListNavItemIconographyLeft iconSize="small">
          {icon}
        </JuiListNavItemIconographyLeft>
        <ItemText>{title}</ItemText>
        <StyledRightWrapper>
          {!expanded ? umi : null}
          {!hideArrow ? (
            <JuiListNavItemIconography iconSize="medium" onClick={onArrowClick}>
              {arrow}
            </JuiListNavItemIconography>
          ) : null}
        </StyledRightWrapper>
      </JuiListNavItem>
    );
  },
);

export default JuiConversationListSectionHeader;
export { JuiConversationListSectionHeader, JuiSectionHeaderProps };
