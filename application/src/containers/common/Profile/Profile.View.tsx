/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileButtonViewProps } from './types';
import { JuiModal } from '@/containers/Dialog';
import { GroupTeamProfile } from '@/containers/GroupTeamProfile';

type Props = ProfileButtonViewProps & WithNamespaces;
import { JuiButton } from 'jui/components/Buttons';

class ProfileButton extends Component<Props> {
  private onClick = () => {
    const { id } = this.props;
    JuiModal.open(GroupTeamProfile, {
      componentProps: { id },
      size: 'medium',
    });
  }
  render() {
    const { t } = this.props;
    return (
      <JuiButton onClick={this.onClick} variant="text" color="primary">
        {t('Profile')}
      </JuiButton>
    );
  }
}

const ProfileButtonView = translate('translations')(ProfileButton);

export { ProfileButtonView };
