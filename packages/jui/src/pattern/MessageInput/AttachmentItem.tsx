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

enum ITEM_STATUS {
  NORMAL,
  LOADING,
  ERROR,
}

type StatusProps = {
  status: ITEM_STATUS;
};

type AttachmentItemProps = StatusProps &
  IconProps & {
    progress?: number;
    name: string;
    hideRemoveButton?: boolean;
    onClickDeleteButton?: (event: MouseEvent) => void;
  };

const StatusMap = {
  [ITEM_STATUS.NORMAL]: grey('900'),
  [ITEM_STATUS.LOADING]: grey('900'),
  [ITEM_STATUS.ERROR]: palette('semantic', 'negative'),
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

type AttachmentItemActionProps = StatusProps & {
  onClick?: (event: MouseEvent) => void;
  loading?: boolean;
  value?: number;
  hideRemoveButton?: boolean;
  icon?: string | JSX.Element;
};

const AttachmentItemAction: React.SFC<AttachmentItemActionProps> = (
  props: AttachmentItemActionProps,
) => (
  <ActionWrapper
    onClick={!props.hideRemoveButton ? props.onClick : undefined}
    data-test-automation-id="attachment-action-button"
  >
    {typeof props.value !== 'undefined' &&
      props.status === ITEM_STATUS.LOADING && (
        <JuiCircularProgress variant="static" size={24} value={props.value} />
      )}
    <IconWrapper>
      {typeof props.icon === 'string'
        ? !props.hideRemoveButton && (
            <JuiIconButton variant="plain" tooltipTitle={t('Remove')}>
              close
            </JuiIconButton>
          )
        : props.icon}
    </IconWrapper>
  </ActionWrapper>
);

const AttachmentItem: React.SFC<AttachmentItemProps> = (
  props: AttachmentItemProps,
) => {
  const {
    name,
    status,
    hideRemoveButton,
    onClickDeleteButton,
    progress,
  } = props;
  const action = (
    <AttachmentItemAction
      status={status}
      onClick={onClickDeleteButton}
      loading={status === ITEM_STATUS.LOADING}
      value={progress}
      hideRemoveButton={hideRemoveButton}
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

export { AttachmentItem, ITEM_STATUS, AttachmentItemAction };
