/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, MouseEvent } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileButtonViewProps } from './types';
// import { JuiModal } from '@/containers/Dialog';
type Props = ProfileButtonViewProps & WithNamespaces;
// import styled from 'jui/foundation/styled-components';
import { JuiButton } from 'jui/components/Buttons';

class ProfileButton extends Component<Props> {
  private onClick = (event: MouseEvent<HTMLElement>) => {
    this.props.handleGlobalGroupId(event);
    // JuiModal.open(GroupTeamProfile, { size: 'medium' });
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
