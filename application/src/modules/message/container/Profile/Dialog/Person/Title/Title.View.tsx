/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { IMessageService } from '@/modules/message/interface';
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
  @IMessageService private _messageService: IMessageService;
  onClick = () => portalManager.dismissLast();
  handleEditClick = () => this._messageService.open(this.props.id);
  render() {
    const { id, t, isTheCurrentUserProfile } = this.props;
    return (
      <>
        <JuiDialogHeaderTitle>{t('people.team.profile')}</JuiDialogHeaderTitle>
        <JuiDialogHeaderActions>
          {isTheCurrentUserProfile && (
            <JuiIconButton
              onClick={this.handleEditClick}
              data-test-automation-id="editProfileIcon"
              tooltipTitle={t('common.dialog.edit')}
              ariaLabel={t('common.dialog.edit')}
            >
              edit
            </JuiIconButton>
          )}
          <Favorite id={id} size="medium" dataTrackingProps={{ source: 'profileDialog', conversationType: '1:1 conversation' }} />
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
