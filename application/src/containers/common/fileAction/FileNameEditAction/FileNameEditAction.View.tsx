/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiMenuItem } from 'jui/components/Menus';
import { FileNameEditActionViewProps } from './types';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiIconography } from 'jui/foundation/Iconography';
import { FileNameEditDialog } from './FileNameEditDialog';

@observer
class FileNameEditActionViewComponent extends Component<
  FileNameEditActionViewProps
> {
  handleClick = () => {
    const { fileId, postId } = this.props;
    FileNameEditDialog.show({ fileId, postId });
  }

  iconCom = (
    <JuiIconography iconColor={['grey', '500']} iconSize="small">
      edit
    </JuiIconography>
  );

  render() {
    const { canEditFileName, t } = this.props;

    return (
      <JuiMenuItem
        icon={this.iconCom}
        disabled={!canEditFileName}
        data-test-automation-id={'fileNameEditItem'}
        onClick={this.handleClick}
      >
        {t('message.prompt.editFileNameTitle')}
      </JuiMenuItem>
    );
  }
}

const FileNameEditActionView = withTranslation('translations')(
  FileNameEditActionViewComponent,
);
export { FileNameEditActionView };
