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
  JuiListNavItemIconography,
} from '../../components/Lists';
import { typography } from '../../foundation/utils';

const StyledRightWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
`;

const StyledItemText = styled(ItemText)`
  && {
    ${typography('caption2')};
    font-weight: ${({ theme }) => theme.typography.subheading3.fontWeight};
    color: ${({ theme }) => theme.palette.grey['600']};
  }
`;

type JuiSectionHeaderProps = {
  title: string;
  umi?: JSX.Element;
  expanded?: boolean;
  className?: string;
  hideArrow?: boolean;
  selected?: boolean;
  paddingRang?: number;
  onClick?: (e: React.MouseEvent) => any;
  onArrowClick?: (e: React.MouseEvent) => any;
};

const JuiConversationListSectionHeader = memo(
  (props: JuiSectionHeaderProps) => {
    const {
      title,
      umi,
      expanded,
      className,
      hideArrow,
      onClick,
      onArrowClick,
      selected,
      paddingRang,
      ...rest
    } = props;

    const arrow = expanded ? 'arrow_up' : 'arrow_down';

    return (
      <JuiListNavItem
        className={className}
        paddingRange={paddingRang}
        data-test-automation-id="conversation-list-section-header"
        button
        selected={selected}
        classes={{ selected: 'selected' }}
        onClick={onClick}
        {...rest}
      >
        <StyledItemText>{title}</StyledItemText>
        <StyledRightWrapper>
          {!expanded ? umi : null}
          {!hideArrow ? (
            <JuiListNavItemIconography
              iconSize="medium"
              iconColor={['grey', '500']}
              onClick={onArrowClick}
              data-test-automation-id={
                expanded
                  ? 'conversation-list-section-header-arrow-up'
                  : 'conversation-list-section-header-arrow-down'
              }
            >
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
