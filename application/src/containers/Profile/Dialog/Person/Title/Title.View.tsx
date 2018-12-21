/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileDialogPersonTitleViewProps } from './types';
import {
  JuiDialogTitleWithActionLeft,
  JuiDialogTitleWithActionRight,
} from 'jui/components/Dialog';
import { Favorite } from '@/containers/common/Favorite';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';

@observer
class ProfileDialogPersonTitleViewComponent extends Component<
  WithNamespaces & ProfileDialogPersonTitleViewProps
> {
  render() {
    const { id, t, dismiss } = this.props;
    return (
      <>
        <JuiDialogTitleWithActionLeft>
          {t('profile')}
        </JuiDialogTitleWithActionLeft>
        <JuiDialogTitleWithActionRight>
          <Favorite id={id} size="medium" />
          <JuiIconButton
            onClick={dismiss}
            tooltipTitle={t('close')}
            ariaLabel={t('close')}
          >
            close
          </JuiIconButton>
        </JuiDialogTitleWithActionRight>
      </>
    );
  }
}

const ProfileDialogPersonTitleView = translate('translations')(
  ProfileDialogPersonTitleViewComponent,
);

export { ProfileDialogPersonTitleView };
