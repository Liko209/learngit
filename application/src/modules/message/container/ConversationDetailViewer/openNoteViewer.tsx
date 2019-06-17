/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-17 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  JuiDialogHeader,
  JuiDialogHeaderActions,
} from 'jui/components/Dialog/DialogHeader';
import { JuiNoteIframe, JuiNoteTitle } from 'jui/pattern/ConversationItemCard';
import i18nT from '@/utils/i18nT';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiDivider } from 'jui/components/Divider';
import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Dialog } from '@/containers/Dialog';

const getShowDialogPermission = async () => {
  const permissionService = ServiceLoader.getInstance<PermissionService>(
    ServiceConfig.PERMISSION_SERVICE,
  );
  return await permissionService.hasPermission(
    UserPermissionType.CAN_SHOW_NOTE,
  );
};

const buildRefHandle = (bodyInfo: any) => (iframe: any) => {
  if (!iframe) return;
  const iframeContentDocument = iframe.contentDocument;
  if (!iframeContentDocument) return;
  iframeContentDocument.open();
  iframeContentDocument.write(bodyInfo);
  iframeContentDocument.close();
};

const openNoteViewer = async (title: string, bodyInfo: string) => {
  const showNoteDialog = await getShowDialogPermission();
  if (!showNoteDialog) return;
  const handleRef = buildRefHandle(bodyInfo);
  const { dismiss } = Dialog.simple(
    <>
      <>
        <JuiDialogHeader>
          <JuiNoteTitle>{title}</JuiNoteTitle>
          <JuiDialogHeaderActions>
            <JuiButtonBar overlapSize={2.5}>
              <JuiIconButton
                onClick={() => dismiss()}
                tooltipTitle={await i18nT('common.dialog.close')}
              >
                close
              </JuiIconButton>
            </JuiButtonBar>
          </JuiDialogHeaderActions>
        </JuiDialogHeader>
        <JuiDivider key="divider-filters" />
      </>
      <JuiNoteIframe ref={handleRef} />
    </>,
    {
      fullScreen: true,
      enableEscapeClose: true,
      onClose: () => dismiss(),
    },
  );
};

export { openNoteViewer };
