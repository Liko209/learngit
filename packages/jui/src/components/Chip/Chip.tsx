/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:48:39
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiChip, { ChipProps as MuiChipProps } from '@material-ui/core/Chip';
import { JuiIconButton } from '../Buttons/IconButton';
import styled from '../../foundation/styled-components';
import { width, spacing, height } from '../../foundation/utils/styles';
import { Omit } from '../../foundation/utils/typeHelper';

type TJuiChipProps = {
  uid?: number;
  ChipAvatar?: React.ComponentType<any>;
  onDelete?: (event: any) => void;
} & Omit<MuiChipProps, 'innerRef'>;

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
  .avatar {
    color: ${({ theme }) => theme.palette.common.white};
  }
`;

export const JuiChip: React.SFC<TJuiChipProps> = (props: TJuiChipProps) => {
  const { onDelete, ChipAvatar, ...rest } = props;
  const avatar: any = ChipAvatar ? (
    <ChipAvatar size="small" uid={rest.uid} />
  ) : null;

  return (
    <StyledChip
      {...rest}
      onDelete={onDelete}
      avatar={avatar}
      classes={{ deleteIcon: 'deleteIcon', label: 'label', avatar: 'avatar' }}
      deleteIcon={
        <JuiIconButton variant="plain" tooltipTitle="remove">
          cancel
        </JuiIconButton>
      }
    />
  );
};
