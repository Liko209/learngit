/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewerTitleViewProps } from './types';
import { JuiDialogTitleWithActionLeft, JuiDialogTitleWithActionRight } from 'jui/components/Dialog';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { DialogContext } from '@/containers/Dialog';

@observer
class ViewerTitleViewComponent extends Component<WithNamespaces & ViewerTitleViewProps> {
  static contextType = DialogContext;

  dismiss = this.context;

  render() {
    const { t } = this.props;
    return (
      <>
        <JuiDialogTitleWithActionLeft>{t('people.team.profile')}</JuiDialogTitleWithActionLeft>
        <JuiDialogTitleWithActionRight>
          <JuiIconButton
            onClick={this.dismiss}
            tooltipTitle={t('common.dialog.close')}
            ariaLabel={t('common.dialog.close')}
          >
            close
          </JuiIconButton>
        </JuiDialogTitleWithActionRight>
      </>
    );
  }
}

const ViewerTitleView = translate('translations')(ViewerTitleViewComponent);

export { ViewerTitleView };
