/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 19:31:28
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiMiniCard,
  JuiMiniCardHeader,
  JuiMiniCardFooter,
} from 'jui/pattern/MiniCard';
import {
  JuiProfileMiniCardFooterLeft,
  JuiProfileMiniCardFooterRight,
} from 'jui/pattern/ProfileMiniCard';
import { ProfileMiniCardGroupHeader } from './ProfileMiniCardGroupHeader';
import { Profile } from '@/containers/common/Profile';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = WithNamespaces & {
  id: number;
};

class ProfileMiniCardGroupComponent extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { id, t } = this.props;
    return (
      <JuiMiniCard>
        <JuiMiniCardHeader>
          <ProfileMiniCardGroupHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter>
          <JuiProfileMiniCardFooterLeft>
            <Profile id={id} />
          </JuiProfileMiniCardFooterLeft>
          <JuiProfileMiniCardFooterRight>
            <JuiIconButton
              size="medium"
              color="primary"
              variant="plain"
              tooltipTitle={t('Messages')}
            >
              chat_bubble
            </JuiIconButton>
          </JuiProfileMiniCardFooterRight>
        </JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

const ProfileMiniCardGroup = translate('translations')(
  ProfileMiniCardGroupComponent,
);

export { ProfileMiniCardGroup };
