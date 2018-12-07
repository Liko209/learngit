/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileDialogPersonTitleViewProps } from './types';
import {
  JuiDialogTitleWithActionLeft,
  JuiDialogTitleWithActionRight,
} from 'jui/components/Dialog';
import { Favorite } from '@/containers/common';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';

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
          <Favorite id={id} />
          <JuiIconButton onClick={dismiss} tooltipTitle={t('close')}>
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
