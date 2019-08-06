/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-30 01:26:14
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiDialogContent } from 'jui/components/Dialog';
import { StyledDialogHeader, StyledJuiDialogTitle } from 'jui/pattern/E911';
import { i18nP } from '@/utils/i18nT';
import { Dialog } from '@/containers/Dialog';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';

const Z_INDEX_GREATER_THAN_TOOLTIP = 1600;

type E911DialogProps = {
  id: string;
  content: string;
  onOK?: () => any;
  okText?: string;
  onCancel: () => any;
};

type titleProps = {
  id: string;
  onClick: () => void;
};

function DialogTitle({ onClick }: titleProps) {
  return (
    <StyledDialogHeader data-test-automation-id="DialogTitle">
      <StyledJuiDialogTitle>
        {i18nP('common.dialog.Alert')}
      </StyledJuiDialogTitle>
      <JuiIconButton
        data-test-automation-id="emergencyPromptDialogCrossButton"
        variant="plain"
        onClick={onClick}
        tooltipTitle={i18nP('common.dialog.close')}
      >
        close
      </JuiIconButton>
    </StyledDialogHeader>
  );
}

function alertE911Dialog({
  id,
  content,
  onOK,
  okText,
  onCancel,
}: E911DialogProps) {
  const dialog = Dialog.alert({
    content,
    onOK,
    okText,
    title: (
      <DialogTitle
        id={id}
        onClick={() => {
          onCancel();
          dialog.dismiss();
        }}
      />
    ),
    modalProps: {
      'data-test-automation-id': `${id}Dialog`,
      style: {
        'z-index': Z_INDEX_GREATER_THAN_TOOLTIP.toString()
      }
    },
    size: 'small',
  });
}

function simpleE911Dialog({ id, content, onCancel }: E911DialogProps) {
  const dialog = Dialog.simple(
    <>
      <DialogTitle
        data-test-automation-id="e911-prompt-dialog"
        id={id}
        onClick={() => {
          onCancel();
          dialog.dismiss();
        }}
      />
      <JuiDialogContent data-test-automation-id={`${id}DialogContent`}>
        {content}
      </JuiDialogContent>
    </>,
    {
      size: 'small',
      componentProps: {
        'data-test-automation-id': `${id}Dialog`,
        style: {
          'z-index': Z_INDEX_GREATER_THAN_TOOLTIP.toString()
        }
      }
    },
  );
}

export { alertE911Dialog, simpleE911Dialog };
