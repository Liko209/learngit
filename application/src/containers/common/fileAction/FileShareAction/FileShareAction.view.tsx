import React, { useCallback, useMemo } from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { useTranslation } from 'react-i18next';
import { JuiIconography } from 'jui/foundation/Iconography';
import { useContactSearchDialog } from './hooks/useContactSearchDialog';
import { PostService } from 'sdk/module/post';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import portalManager from '@/common/PortalManager';
import { getConversationId } from '@/common/goToConversation';
import { wrapHandleError, NOTIFICATION_TYPE } from '@/common/catchError';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { Notification } from '@/containers/Notification';
import i18nT from '@/utils/i18nT';
import { dataAnalysis } from 'foundation/analysis';
import { getEntity } from '@/store/utils';
import { Item } from 'sdk/module/item/entity';
import { ENTITY_NAME } from '@/store';
import FileItemModel from '@/store/models/FileItem';
import { errorHandler } from './errorHandler';

interface Props {
  fileId: number;
  postId?: number;
  groupId?: number;
}

const FileShareAction = (props: Props) => {
  const { t } = useTranslation();
  const { fileId, groupId } = props;
  let postId = props.postId;
  const share = useMemo(
    () => (
      <JuiIconography iconColor={['grey', '500']} iconSize="small">
        share
      </JuiIconography>
    ),
    [],
  );
  const shareToConversation = async (contact: { id: number }) => {
    portalManager.dismissLast();
    dataAnalysis.track('Jup_Web/DT_msg_shareFileToConversation', {
      source: 'conversation_shareFile',
    });
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    const conversationId = await getConversationId(contact.id);
    if (!conversationId || !groupId) {
      return;
    }
    if (!postId) {
      const item = getEntity<Item, FileItemModel>(ENTITY_NAME.ITEM, fileId);
      const post = await item.getDirectRelatedPostInGroup(groupId);
      if (post && post.id) {
        postId = post.id;
      } else {
        return;
      }
    }
    try {
      await postService.shareItem(postId, fileId, conversationId);
      Notification.flashToast({
        message: await i18nT(`item.prompt.shareSuccess`),
        type: ToastType.SUCCESS,
        messageAlign: ToastMessageAlign.CENTER,
        fullWidth: false,
        dismissible: false,
      });
    } catch (e) {
      const message = errorHandler(e);
      Notification.flashToast({
        message: await i18nT(`item.prompt.${message}`),
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.CENTER,
        fullWidth: false,
        dismissible: false,
      });
    }
  };
  const shareToConversationCB = useCallback(
    wrapHandleError(shareToConversation, NOTIFICATION_TYPE.FLASH, {
      network: 'item.prompt.shareFileNetworkError',
      server: 'item.prompt.shareFileBackendError',
    }),
    [postId, fileId],
  );

  const [openContactSearchDialog] = useContactSearchDialog(
    shareToConversationCB,
    [shareToConversationCB],
  );
  const openDialog = useCallback(() => {
    dataAnalysis.page('Jup_Web/DT_msg_shareFileToConversation');
    openContactSearchDialog();
  }, [openContactSearchDialog]);
  return (
    <JuiMenuItem
      data-test-automation-id={'fileShareItem'}
      icon={share}
      onClick={openDialog}
    >
      {t('message.prompt.shareFile')}
    </JuiMenuItem>
  );
};

export { FileShareAction };
