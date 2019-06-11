/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 16:21:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiListItem, JuiListItemProps } from '../../components/Lists';
import styled, { css } from '../../foundation/styled-components';
import { primary, spacing, width, height } from '../../foundation/utils';

type ContactItemProps = {
  isUnread: boolean;
  center?: boolean;
} & JuiListItemProps;

const Wrapper = ({ isUnread, center, ...rest }: ContactItemProps) => (
  <JuiListItem {...rest} />
);

const StyledContactItem = styled<ContactItemProps>(Wrapper)`
  && {
    justify-content: ${props => (props.center ? 'center' : 'flex-start')};
    padding: 0;
    .list-item-primary {
      color: ${({ isUnread }) => (isUnread ? primary('main') : null)};
      ${({ isUnread }) => {
        if (!isUnread) {
          return;
        }
        return css`
          &:before {
            content: '';
            display: inline-block;
            width: ${width(2)};
            height: ${height(2)};
            border-radius: 50%;
            background: ${primary('main')};
            margin: ${spacing(0, 1, 0, 0)};
          }
        `;
      }}
    }
  }
`;

const ContactItem = (props: ContactItemProps) => {
  const { isUnread, center, ...rest } = props;
  return <StyledContactItem isUnread={isUnread} center={center} {...rest} />;
};

export { ContactItem };
