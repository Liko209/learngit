/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ProfileDialogPersonTitleViewProps } from './types';
import {
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
} from 'jui/components/Dialog';
import { Favorite } from '@/containers/common/Favorite';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import portalManager from '@/common/PortalManager';

@observer
class ProfileDialogPersonTitleViewComponent extends Component<
  WithTranslation & ProfileDialogPersonTitleViewProps
> {
  onClick = () => portalManager.dismissLast();
  render() {
    const { id, t } = this.props;
    return (
      <>
        <JuiDialogHeaderTitle>{t('people.team.profile')}</JuiDialogHeaderTitle>
        <JuiDialogHeaderActions>
          <Favorite id={id} size="medium" />
          <JuiIconButton
            onClick={this.onClick}
            tooltipTitle={t('common.dialog.close')}
            ariaLabel={t('common.dialog.close')}
          >
            close
          </JuiIconButton>
        </JuiDialogHeaderActions>
      </>
    );
  }
}

const ProfileDialogPersonTitleView = withTranslation('translations')(
  ProfileDialogPersonTitleViewComponent,
);

export { ProfileDialogPersonTitleView };
