/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-30 01:26:14
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { StyledDialogHeader, StyledJuiDialogTitle } from 'jui/pattern/E911';
import { i18nP } from '@/utils/i18nT';
import { Dialog } from '@/containers/Dialog';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';

const Z_INDEX_GREATER_THAN_TOOLTIP = 1600;

type E911DialogProps = {
  content: string;
  onOK?: () => any;
  okText?: string;
  onCancel?: () => any;
  showCloseIcon?: boolean;
};

type titleProps = {
  showCloseIcon?: boolean;
  onClick: () => void;
};

function DialogTitle({ onClick, showCloseIcon }: titleProps) {
  return (
    <StyledDialogHeader data-test-automation-id="DialogTitle">
      <StyledJuiDialogTitle>
        {i18nP('common.dialog.Alert')}
      </StyledJuiDialogTitle>
      {showCloseIcon ? (
        <JuiIconButton
          data-test-automation-id="emergencyConfirmDialogCrossButton"
          variant="plain"
          onClick={onClick}
          tooltipTitle={i18nP('common.dialog.close')}
        >
          close
        </JuiIconButton>
      ) : null}
    </StyledDialogHeader>
  );
}

function alertE911Dialog({
  content,
  onOK,
  okText,
  onCancel,
  showCloseIcon,
}: E911DialogProps) {
  const dialog = Dialog.alert({
    content,
    onOK,
    okText,
    title: (
      <DialogTitle
        onClick={() => {
          onCancel && onCancel();
          dialog.dismiss();
        }}
        showCloseIcon={showCloseIcon}
      />
    ),
    modalProps: {
      'data-test-automation-id': 'emergencyConfirmDialog',
      style: {
        zIndex: Z_INDEX_GREATER_THAN_TOOLTIP.toString()
      }
    },
    okBtnProps: {
      'data-test-automation-id': 'emergencyConfirmDialogOkButton'
    },
    cancelBtnProps: {
      'data-test-automation-id': 'emergencyConfirmDialogCancelButton'
    },
    size: 'small',
  });
}

export { alertE911Dialog };
