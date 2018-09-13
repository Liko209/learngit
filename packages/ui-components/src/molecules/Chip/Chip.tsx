/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:48:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import MuiChip, { ChipProps } from '@material-ui/core/Chip';
import JuiAvatar from '../../atoms/Avatar';
import { width } from '../../utils/styles';

type TJuiChipProps = {
  avatarUrl?: string;
  handleDelete?: () => void;
} & ChipProps;

const StyledChip = styled<TJuiChipProps>(MuiChip)`
  && {
    padding: ${width(1)};
    box-sizing: border-box;
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity * 1};
    }
    &:active {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity * 2};
    }
  }

  .deleteIcon {
    width: ${width(5)};
    height: ${width(5)};
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
