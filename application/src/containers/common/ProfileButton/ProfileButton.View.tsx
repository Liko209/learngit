/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileButtonViewProps } from './types';
import { JuiModal } from '@/containers/Dialog';
// import { GroupTeamProfile } from '@/containers/GroupTeamProfile';
import { MiniCard } from '@/containers/MiniCard';
import {
  ProfileDialogGroup,
  ProfileDialogPerson,
} from '@/containers/Profile/Dialog';
import { JuiButton } from 'jui/components/Buttons';
import { TypeDictionary } from 'sdk/utils';

const MappingComponent = {
  [TypeDictionary.TYPE_ID_PERSON]: ProfileDialogPerson,
  [TypeDictionary.TYPE_ID_GROUP]: ProfileDialogGroup,
  [TypeDictionary.TYPE_ID_TEAM]: ProfileDialogGroup,
};

class ProfileButton extends Component<WithNamespaces & ProfileButtonViewProps> {
  private _onClickViewProfile = () => {
    const { id, typeId } = this.props;
    MiniCard.dismissProfile();
    JuiModal.open(MappingComponent[typeId], {
      componentProps: { id },
      size: 'medium',
    });
  }

  render() {
    const { t } = this.props;
    return (
      <JuiButton
        onClick={this._onClickViewProfile}
        variant="text"
        color="primary"
      >
        {t('profile')}
      </JuiButton>
    );
  }
}

const ProfileButtonView = translate('translations')(ProfileButton);

export { ProfileButtonView };
