/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-10 18:40:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent, MouseEvent, memo } from 'react';
import styled from '../../foundation/styled-components';

import i18next from 'i18next';
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
    fileIcon: string;
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
  top: ${spacing(0.75)};
  right: ${spacing(-0.75)};
`;

const ProgressWrapper = styled.div`
  position: absolute;
  right: ${spacing(-1.25)};
  top: ${spacing(0.25)};
`;

type AttachmentItemActionProps = StatusProps & {
  onClick?: (event: MouseEvent) => void;
  loading?: boolean;
  value?: number;
  hideRemoveButton?: boolean;
  icon?: string | JSX.Element;
};

const AttachmentItemAction: React.SFC<AttachmentItemActionProps> = memo(
  (props: AttachmentItemActionProps) => (
    <ActionWrapper
      onClick={!props.hideRemoveButton ? props.onClick : undefined}
      data-test-automation-id="attachment-action-button"
    >
      {typeof props.value !== 'undefined' &&
        props.status === ITEM_STATUS.LOADING && (
          <ProgressWrapper>
            <JuiCircularProgress
              variant="static"
              size={24}
              value={props.value}
            />
          </ProgressWrapper>
        )}
      <IconWrapper>
        {typeof props.icon === 'string'
          ? !props.hideRemoveButton && (
              <JuiIconButton variant="plain" tooltipTitle={i18next.t('Remove')}>
                close
              </JuiIconButton>
            )
          : props.icon}
      </IconWrapper>
    </ActionWrapper>
  ),
);

class AttachmentItem extends PureComponent<AttachmentItemProps> {
  render() {
    const {
      name,
      status,
      hideRemoveButton,
      onClickDeleteButton,
      progress,
      fileIcon,
    } = this.props;
    const loading = status === ITEM_STATUS.LOADING;
    const action = (
      <AttachmentItemAction
        status={status}
        onClick={onClickDeleteButton}
        loading={loading}
        value={progress}
        hideRemoveButton={hideRemoveButton}
        icon="close"
      />
    );
    return (
      <Wrapper>
        <JuiFileWithExpand
          icon={fileIcon}
          fileNameColor={StatusMap[status]}
          fileNameOpacity={loading ? 0.26 : 1}
          fileName={name}
          Actions={action}
        />
      </Wrapper>
    );
  }
}

export { AttachmentItem, ITEM_STATUS, AttachmentItemAction };
