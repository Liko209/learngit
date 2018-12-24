/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-10 18:40:06
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import styled from '../../foundation/styled-components';
import { t } from 'i18next';
import {
  height,
  width,
  grey,
  palette,
  spacing,
} from '../../foundation/utils/styles';
// import { JuiIconography } from '../../foundation/Iconography';
import { JuiCircularProgress } from '../../components/Progress';
import { JuiIconButton } from '../../components/Buttons';
import { JuiFileWithExpand } from '../ConversationCard/Files/FileWithExpand';

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
  normal: grey('900'),
  loading: grey('900'),
  error: palette('semantic', 'negative'),
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: ${spacing(0, 4, 2, 0)};
`;

const ActionWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: ${width(6)};
  min-width: ${width(6)};
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
    {typeof props.value !== 'undefined' && (
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
  const { name, status, onClickDeleteButton, progress } = props;
  const loading = status === 'loading' || typeof progress !== 'undefined';
  const action = (
    <AttachmentItemAction
      onClick={onClickDeleteButton}
      loading={loading}
      value={progress}
      icon="close"
    />
  );
  return (
    <Wrapper>
      <JuiFileWithExpand
        fileNameColor={StatusMap[status || '']}
        fileName={name}
        Actions={action}
      />
    </Wrapper>
  );
};

AttachmentItem.defaultProps = {
  status: 'normal',
};

export { AttachmentItem, ItemStatus, AttachmentItemAction };
