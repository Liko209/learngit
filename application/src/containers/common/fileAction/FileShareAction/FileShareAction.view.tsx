import React, { useCallback } from 'react'
import { JuiMenuItem } from 'jui/components/Menus';
import { useTranslation } from 'react-i18next';
import { JuiIconography } from 'jui/foundation/Iconography';
import { useContactSearchDialog } from './hooks/useContactSearchDialog';
import { PostService } from 'sdk/module/post';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

interface Props {
  fileId: number,
  postId: number
}

const share = <JuiIconography iconColor={['grey', '500']} iconSize="small">share</JuiIconography>
const FileShareAction = (props: Props) => {
  const { t } = useTranslation();
  const { fileId, postId } = props
  const shareToConversation = useCallback((group: { id: number }) => {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    postService.shareItem(postId, fileId, group.id)
  }, [])
  const [openContactSearchDialog] = useContactSearchDialog(shareToConversation, [])
  return (
    <JuiMenuItem data-test-automation-id={'fileShareItem'} icon={share} onClick={openContactSearchDialog}>
      {t('message.prompt.shareFile')}
    </JuiMenuItem>)
}

export { FileShareAction }
