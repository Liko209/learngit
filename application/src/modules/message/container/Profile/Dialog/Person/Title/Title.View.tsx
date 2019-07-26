/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { container } from 'framework';
import { MESSAGE_SERVICE } from '@/modules/message/interface/constant';
import { MessageService } from '@/modules/message/service';
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
  _messageService: MessageService = container.get(MESSAGE_SERVICE);
  onClick = () => portalManager.dismissLast();
  render() {
    const { id, t } = this.props;
    return (
      <>
        <JuiDialogHeaderTitle>{t('people.team.profile')}</JuiDialogHeaderTitle>
        <JuiDialogHeaderActions>
          <JuiIconButton
            onClick={() => {
              this._messageService.open(id);
            }}
            tooltipTitle={t('common.dialog.edit')}
            ariaLabel={t('common.dialog.edit')}
          >
            edit
          </JuiIconButton>
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
