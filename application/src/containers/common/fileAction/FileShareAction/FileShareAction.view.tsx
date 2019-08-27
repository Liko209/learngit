import React, { useCallback } from 'react'
import { JuiMenuItem } from 'jui/components/Menus';
import { useTranslation } from 'react-i18next';
import { JuiIconography } from 'jui/foundation/Iconography';
import { useContactSearchDialog } from './hooks/useContactSearchDialog';

const share = <JuiIconography iconColor={['grey', '500']} iconSize="small">share</JuiIconography>
const FileShareAction = () => {
  const { t } = useTranslation();
  const shareToConversation= useCallback((item:{id:number})=>{
    // eslint-disable-next-line
    console.log(item.id)
  },[])
  const [openContactSearchDialog] = useContactSearchDialog(shareToConversation,[])
  return (
    <JuiMenuItem data-test-automation-id={'fileShareItem'} icon={share} onClick={openContactSearchDialog}>
      {t('message.prompt.shareFile')}
    </JuiMenuItem>)
}

export { FileShareAction }
