/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-06 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
  JuiDialogHeaderMeta,
  JuiDialogHeaderMetaLeft,
  JuiDialogHeaderMetaRight,
  JuiDialogHeaderSubtitle,
} from 'jui/components/Dialog/DialogHeader';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { Avatar } from '@/containers/Avatar';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import { FileActionMenu } from '@/containers/common/fileAction';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiViewerTitleWrap } from 'jui/pattern/Viewer/ViewerTitle';
import { TitleType } from '../container/ViewerView/interface';
import { Download } from '@/containers/common/Download';

type Type = TitleType &
  WithTranslation & {
    closeViewer: () => void;
  };

@observer
class ViewerTitleViewComponent extends Component<Type> {
  render() {
    const {
      uid,
      userDisplayName,
      name,
      downloadUrl,
      createdAt,
      textFieldValue,
      currentPageIdx,
      pageTotal,
      fileId,
      handleTextFieldChange,
      t,
      closeViewer,
    } = this.props;
    return (
      <>
        <JuiDialogHeaderMeta>
          <JuiDialogHeaderMetaLeft>
            <Avatar
              uid={uid}
              data-test-automation-id={'previewerSenderAvatar'}
            />
          </JuiDialogHeaderMetaLeft>
          <JuiDialogHeaderMetaRight
            title={userDisplayName}
            data-test-automation-id={'previewerSenderInfo'}
            subtitle={createdAt}
          />
        </JuiDialogHeaderMeta>
        <JuiDialogHeaderTitle
          variant="responsive"
          data-test-automation-id={'previewerTitle'}
        >
          <JuiViewerTitleWrap>
            {name}
            <JuiTextField
              id="outlined-number"
              label=""
              type="number"
              defaultValue={1}
              value={textFieldValue}
              onChange={handleTextFieldChange}
              inputProps={{
                'aria-label': 'numberInput',
              }}
            />
            <JuiDialogHeaderSubtitle>{`(${currentPageIdx}/${pageTotal})`}</JuiDialogHeaderSubtitle>
          </JuiViewerTitleWrap>
        </JuiDialogHeaderTitle>
        <JuiDialogHeaderActions>
          <JuiButtonBar overlapSize={-2}>
            <Download url={downloadUrl} />
            <FileActionMenu fileId={fileId} disablePortal={true} />
            <JuiIconButton
              onClick={closeViewer}
              aria-label={t('common.dialog.close')}
              tooltipTitle={t('common.dialog.close')}
            >
              close
            </JuiIconButton>
          </JuiButtonBar>
        </JuiDialogHeaderActions>
      </>
    );
  }
}

const ViewerTitleView = withTranslation('translations')(
  ViewerTitleViewComponent,
);

export { ViewerTitleView };
