/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-26 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
} from 'jui/components/Dialog/DialogHeader';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import { SingleImageViewerTitleViewProp } from './types';

type Type = SingleImageViewerTitleViewProp &
  WithTranslation & {
    closeViewer: () => void;
  };

@observer
class SingleImageViewerTitleViewComponent extends Component<Type> {
  render() {
    const { displayName, t, closeViewer } = this.props;
    return (
      <>
        <JuiDialogHeaderTitle data-test-automation-id="viewerTitle">
          {displayName}
        </JuiDialogHeaderTitle>
        <JuiDialogHeaderActions data-test-automation-id="viewerActions">
          <JuiButtonBar overlapSize={2}>
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

const SingleImageViewerTitleView = withTranslation('translations')(
  SingleImageViewerTitleViewComponent,
);

export { SingleImageViewerTitleView };
