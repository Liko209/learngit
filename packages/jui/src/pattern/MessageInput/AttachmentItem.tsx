/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-10 18:40:06
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import styled from '../../foundation/styled-components';
import { t } from 'i18next';
import {
  shape,
  spacing,
  height,
  width,
  grey,
  palette,
} from '../../foundation/utils/styles';
// import { JuiIconography } from '../../foundation/Iconography';
import { truncateLongName } from '../../foundation/utils/getFileName';
import { JuiCircularProgress } from '../../components/Progress';
import { JuiIconButton } from '../../components/Buttons';

import defaultIcon from './default.svg';

const MAX_TITLE_LENGTH = 36;

type IconProps = {
  icon?: string;
};

type ItemStatus = 'normal' | 'loading' | 'error';

type StatusProps = {
  status?: ItemStatus;
};

type AttachmentItemProps = IconProps &
  StatusProps & {
    progress?: number;
    name: string;
    onClickDeleteButton?: (event: MouseEvent) => void;
  };

const StatusMap = {
  normal: (theme: any) => grey('900'),
  loading: (theme: any) => grey('900'),
  error: (theme: any) => palette('semantic', 'negative'),
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${height(5)};
  max-height: ${height(5)};
  width: ${width(77)};
  min-width: ${width(77)};
  max-width: ${width(77)};
  padding: ${spacing(4, 3, 4, 4)};
  border-radius: ${shape('borderRadius', 1)};
  box-shadow: ${props => props.theme.shadows[1]};
  margin-right: ${spacing(4)};
  margin-bottom: ${spacing(2)};
`;

const Icon = styled.div<IconProps>`
  width: ${width(5)};
  height: ${height(5)};
  background-size: cover;
  background-image: url(${({ icon }) => icon || defaultIcon});
  overflow: hidden;
`;

const NameArea = styled.div<StatusProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  height: ${height(5)};
  line-height: ${height(5)};
  max-height: ${height(5)};
  margin-left: ${spacing(2)};
  opacity: ${({ status }) => (status === 'loading' ? '0.26' : 1)};
  color: ${({ theme, status }) => StatusMap[status || 'normal'](theme)};
`;

const ActionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: ${width(6)};
  height: ${height(6)};
`;

const IconWrapper = styled.div`
  position: absolute;
  color: ${grey('500')};
  width: ${width(5)};
  height: ${height(5)};
`;

type AttachmentItemActionProps = {
  onClick?: (event: MouseEvent) => void;
  loading?: boolean;
  value?: number;
  icon?: string | JSX.Element;
};

const AttachmentItemAction: React.SFC<AttachmentItemActionProps> = (
  props: AttachmentItemActionProps,
) => (
  <ActionWrapper
    onClick={props.onClick}
    data-test-automation-id="attachment-action-button"
  >
    {props.value && (
      <JuiCircularProgress variant="static" size={24} value={props.value} />
    )}
    <IconWrapper>
      {typeof props.icon === 'string' ? (
        <JuiIconButton variant="plain" tooltipTitle={t('Remove')}>
          close
        </JuiIconButton>
      ) : (
        props.icon
      )}
    </IconWrapper>
  </ActionWrapper>
);

const AttachmentItem: React.SFC<AttachmentItemProps> = (
  props: AttachmentItemProps,
) => {
  const { icon, name, status, onClickDeleteButton, progress } = props;
  const fileName = truncateLongName(name, MAX_TITLE_LENGTH);
  const loading = status === 'loading' || typeof progress !== 'undefined';
  return (
    <Wrapper>
      <Icon icon={icon} />
      <NameArea status={status} data-test-automation-id="attachment-file-name">
        {fileName}
      </NameArea>
      <AttachmentItemAction
        onClick={onClickDeleteButton}
        loading={loading}
        value={progress}
        icon="close"
      />
    </Wrapper>
  );
};

AttachmentItem.defaultProps = {
  status: 'normal',
};

export { AttachmentItem, ItemStatus, AttachmentItemAction };
