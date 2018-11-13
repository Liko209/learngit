/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';

import styled from '../../foundation/styled-components';
import { spacing, grey, palette, width, height } from '../../foundation/utils';
import { JuiIconography } from '../../foundation/Iconography';
import { ConversationListItemText as ItemText } from './ConversationListItemText';
import { StyledIconographyDraft, StyledIconographyFailure } from './Indicator';

const StyledIconographyMore = styled(JuiIconography)``;

const StyledListItem = styled(MuiMenuItem)`
  && {
    display: ${({ hidden }) => (hidden ? 'none' : 'flex')};
    white-space: nowrap;
    background: ${palette('common', 'white')};
    padding: ${spacing(0, 4, 0, 3)};
    height: ${height(8)};
    line-height: ${height(8)};
    color: ${grey('900')};
    /**
     * Workaround to resolve transition conflicts with react-sortable-hoc
     * Details at https://github.com/clauderic/react-sortable-hoc/issues/334
     */
    transition: transform 0s ease,
      background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }

  &&:active p {
    color: ${palette('primary', 'main')};
  }

  && ${StyledIconographyMore} {
    color: ${palette('grey', '400')};
    display: none;
    font-size: ${spacing(5)};
  }

  &&&:hover {
    background-color: ${grey('50')};
    ${StyledIconographyMore} {
      display: inline-block;
    }
    ${StyledIconographyDraft},
    ${StyledIconographyFailure} {
      display: none;
    }
  }

  &&.selected {
    background: ${palette('common', 'white')};
    p {
      color: ${palette('primary', 'main')};
    }
  }

  &&:last-child {
    margin-bottom: ${spacing(2)};
  }

  .child {
    background: ${palette('primary', '50')};
  }
`;

const StyledPresenceWrapper = styled.div`
  width: ${width(2)};
  height: ${height(2)};
  margin: ${spacing(1.5)};
`;

type JuiConversationListItemProps = {
  title: string;
  presence?: JSX.Element | null;
  umi?: JSX.Element;
  indicator: JSX.Element | null;
  fontWeight?: 'bold' | 'normal';
  onClick?: (e: React.MouseEvent) => any;
  onMoreClick?: (e: React.MouseEvent) => any;
  umiHint?: boolean;
  hidden?: boolean;
} & MuiMenuItemProps;

type IConversationListItem = {
  dependencies?: React.ComponentType[];
} & React.SFC<JuiConversationListItemProps>;

const touchRippleClasses = {
  child: 'child',
};

const JuiConversationListItem: IConversationListItem = (
  props: JuiConversationListItemProps,
) => {
  const {
    title,
    indicator,
    presence,
    umi,
    onClick,
    onMoreClick,
    component,
    selected,
    innerRef,
    umiHint,
    ...rest
  } = props;

  const fontWeight = umiHint ? 'bold' : 'normal';
  return (
    <StyledListItem
      onClick={onClick}
      component={component}
      selected={selected}
      classes={{ selected: 'selected' }}
      TouchRippleProps={{ classes: touchRippleClasses }}
      {...rest}
    >
      <StyledPresenceWrapper>{presence}</StyledPresenceWrapper>
      <ItemText style={{ fontWeight }}>
        {title}
      </ItemText>
      {umi}
      {indicator}
      <StyledIconographyMore onClick={onMoreClick}>more_vert</StyledIconographyMore>
    </StyledListItem>
  );
};

JuiConversationListItem.dependencies = [ItemText, JuiIconography];

export default JuiConversationListItem;
export { JuiConversationListItemProps, JuiConversationListItem };
