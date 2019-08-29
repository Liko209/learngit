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
import { ItemService } from 'sdk/module/item/service';
import { JuiNoteIframe, JuiNoteTitle } from 'jui/pattern/ConversationItemCard';
import i18nT from '@/utils/i18nT';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiDivider } from 'jui/components/Divider';
import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Dialog } from '@/containers/Dialog';

const GET_NOTE_ERROR = 'Error';
const getShowDialogPermission = async () => {
  const permissionService = ServiceLoader.getInstance<PermissionService>(
    ServiceConfig.PERMISSION_SERVICE,
  );
  return await permissionService.hasPermission(
    UserPermissionType.CAN_SHOW_NOTE,
  );
};

const getBodyInfo = async (id: number) => {
  const itemService = ServiceLoader.getInstance<ItemService>(
    ServiceConfig.ITEM_SERVICE,
  );
  try {
    const body = await itemService.getNoteBody(id);
    return body;
  } catch (error) {
    return GET_NOTE_ERROR;
  }
};

const buildIframeContentDocumentUpdate = (iframe: HTMLIFrameElement) => (
  bodyInfo: string,
) => {
  const iframeContentDocument = iframe.contentDocument;
  if (!iframeContentDocument) return;
  iframeContentDocument.open();
  iframeContentDocument.write(bodyInfo);
  iframeContentDocument.close();
};

const buildRefHandle = (id: number) => async (iframe: any) => {
  if (!iframe) return;
  const iframeContentDocumentUpdate = buildIframeContentDocumentUpdate(iframe);
  iframeContentDocumentUpdate('loading...');
  const bodyInfo = await getBodyInfo(id);
  iframeContentDocumentUpdate(bodyInfo);
};

const openNoteViewer = async (title: string, id: number) => {
  const showNoteDialog = await getShowDialogPermission();
  if (!showNoteDialog) return;
  const handleRef = buildRefHandle(id);
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
      onClose: () => dismiss(),
    },
  );
};

export { openNoteViewer };
