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
import { ProfileMiniCardPersonHeader } from './ProfileMiniCardPersonHeader';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ProfileButton } from '@/containers/common/ProfileButton';
import { JuiIconButton } from 'jui/components/Buttons';
import { goToConversation } from '@/common/goToConversation';
import { MiniCard } from '@/containers/MiniCard';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';

type Props = WithNamespaces & {
  id: number;
};

class ProfileMiniCardPersonComponent extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onClickMessage = () => {
    const { id } = this.props;
    const result = goToConversation({ id });
    if (result) {
      MiniCard.dismissProfile();
    }
  }

  render() {
    const { id, t } = this.props;
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return (
      <JuiMiniCard>
        <JuiMiniCardHeader emphasize={id === currentUserId}>
          <ProfileMiniCardPersonHeader id={id} />
        </JuiMiniCardHeader>
        <JuiMiniCardFooter>
          <JuiProfileMiniCardFooterLeft>
            {TypeDictionary.TYPE_ID_PERSON ? null : <ProfileButton id={id} />}
          </JuiProfileMiniCardFooterLeft>
          <JuiProfileMiniCardFooterRight>
            <JuiIconButton
              size="medium"
              color="primary"
              variant="plain"
              tooltipTitle={t('Messages')}
              onClick={this.onClickMessage}
            >
              chat_bubble
            </JuiIconButton>
          </JuiProfileMiniCardFooterRight>
        </JuiMiniCardFooter>
      </JuiMiniCard>
    );
  }
}

const ProfileMiniCardPerson = translate('translations')(
  ProfileMiniCardPersonComponent,
);

export { ProfileMiniCardPerson };
