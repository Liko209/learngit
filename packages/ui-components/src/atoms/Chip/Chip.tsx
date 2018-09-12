/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:48:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import MuiChip, { ChipProps } from '@material-ui/core/Chip';
import JuiAvatar from '../Avatar';
import { width } from '../../utils/styles';

type TJuiChipProps = {
  avatarUrl?: string;
  handleDelete?: () => void;
} & ChipProps;

const StyledChip = styled<TJuiChipProps>(MuiChip)`
  && {
    padding: ${({ theme }) => width(1)({ theme })};
    box-sizing: border-box;
  }

  .deleteIcon {
    width: ${({ theme }) => width(5)({ theme })};
    height: ${({ theme }) => width(5)({ theme })};
  }
`;

const JuiChip: React.SFC<TJuiChipProps> = (props: TJuiChipProps) => {
  const { innerRef, handleDelete, avatarUrl, ...rest } = props;
  return (
    <StyledChip
      {...rest}
      onDelete={handleDelete}
      classes={{ deleteIcon: 'deleteIcon' }}
      avatar={
        avatarUrl ? <JuiAvatar size="small" src={avatarUrl} /> : undefined}
    />
  );
};

export default JuiChip;
