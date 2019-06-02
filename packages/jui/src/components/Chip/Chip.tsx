/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-11 15:48:39
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiChip, { ChipProps as MuiChipProps } from '@material-ui/core/Chip';
import { JuiIconButton } from '../Buttons/IconButton';
import styled from '../../foundation/styled-components';
import { width, spacing, height, palette } from '../../foundation/utils/styles';
import { Omit } from '../../foundation/utils/typeHelper';
import remove from '../../assets/jupiter-icon/icon-delete_circle.svg';

type JuiChipProps = {
  uid?: number;
  PersonAvatar?: React.ComponentType<any>;
  GroupAvatar?: React.ComponentType<any>;
  onDelete?: (event: any) => void;
  isError?: boolean;
  deleteTooltip?: string;
} & Omit<MuiChipProps, 'innerRef'>;

const WrappedChip = ({ isError, ...rest }: JuiChipProps) => (
  <MuiChip {...rest} />
);

const StyledChip = styled<JuiChipProps>(WrappedChip)`
  && {
    margin: ${spacing(1)};
    padding: ${spacing(1)};
    box-sizing: border-box;
    overflow: hidden;
    border-color: ${({ isError }) =>
      isError && palette('semantic', 'negative')};
    color: ${({ isError }) => isError && palette('semantic', 'negative')};
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
    span {
      width: auto;
      height: auto;
    }
  }
`;

export const JuiChip: React.SFC<JuiChipProps> = React.memo(
  (props: JuiChipProps) => {
    const {
      onDelete,
      PersonAvatar,
      GroupAvatar,
      isError,
      id,
      deleteTooltip,
      ...rest
    } = props;
    const getAvatar = () => {
      if (PersonAvatar) {
        return <PersonAvatar size="small" uid={id} />;
      }
      if (GroupAvatar) {
        return <GroupAvatar size="small" cid={id} />;
      }
      return null;
    };

    return (
      <StyledChip
        {...rest}
        onDelete={onDelete}
        avatar={getAvatar() as React.ReactElement}
        variant={isError ? 'outlined' : 'default'}
        isError={isError}
        classes={{
          deleteIcon: 'deleteIcon',
          label: 'label',
          avatar: 'avatar',
        }}
        deleteIcon={
          <JuiIconButton
            variant="plain"
            tooltipTitle={deleteTooltip}
            color={isError ? 'semantic.negative' : 'grey.500'}
            symbol={remove}
          />
        }
      />
    );
  },
);
