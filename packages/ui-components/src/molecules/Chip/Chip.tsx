/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:48:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled, { IDependencies } from '../../styled-components';
import MuiChip, { ChipProps } from '@material-ui/core/Chip';
import JuiAvatar from '../../atoms/Avatar';
import JuiIconButton from '../IconButton';
import { width, spacing, height } from '../../utils/styles';

type TJuiChipProps = {
  uid: number;
  ChipAvatar?: React.ComponentType<any>;
  onDelete?: (event: any) => void;
} & ChipProps;

const StyledChip = styled(MuiChip)`
  && {
    margin: ${spacing(1)};
    padding: ${spacing(1)};
    box-sizing: border-box;
    overflow: hidden;
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity * 1};
    }
    &:active {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity * 2};
    }
  }

  .deleteIcon {
    width: ${width(5)};
    height: ${height(5)};
  }
  .label {
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const JuiChip: React.SFC<TJuiChipProps> & IDependencies = (
  props: TJuiChipProps,
) => {
  const { innerRef, onDelete, ChipAvatar, ...rest } = props;
  const avatar: any = ChipAvatar ? (
    <ChipAvatar size="small" uid={rest.uid} />
  ) : null;

  return (
    <StyledChip
      {...rest}
      onDelete={onDelete}
      avatar={avatar}
      classes={{ deleteIcon: 'deleteIcon', label: 'label' }}
      deleteIcon={
        <JuiIconButton variant="plain" tooltipTitle="remove">
          cancel
        </JuiIconButton>
      }
    />
  );
};

JuiChip.dependencies = [JuiAvatar];

export default JuiChip;
