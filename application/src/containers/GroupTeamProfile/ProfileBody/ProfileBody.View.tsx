/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import {
  JuiGroupProfileBody,
  StyledMessageBtn,
} from 'jui/pattern/GroupTeamProfile';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { Avatar } from '@/containers/Avatar';
import { ProfileHeaderViewProps } from './types';
import { goToConversation } from '../../../common/goToConversation';
import { JuiIconography } from 'jui/foundation/Iconography';
import { CONVERSATION_TYPES } from '@/constants';
import { accessHandler } from '../AccessHandler';

@observer
class ProfileBody extends React.Component<ProfileHeaderViewProps> {
  OnMessageClick = async () => {
    const { id, dismiss } = this.props;
    await goToConversation(id);
    dismiss();
  }
  render() {
    const { displayName, description, id, type, t } = this.props;
    const { goToMessageInfo } = accessHandler(type);
    let avatar;
    if (
      type === CONVERSATION_TYPES.NORMAL_GROUP ||
      type === CONVERSATION_TYPES.TEAM
    ) {
      avatar = <GroupAvatar cid={id} />;
    } else if (
      type === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE ||
      type === CONVERSATION_TYPES.ME
    ) {
      avatar = <Avatar uid={id} />;
    }
    return (
      <JuiGroupProfileBody
        avatar={avatar}
        displayName={displayName}
        description={description}
      >
        <StyledMessageBtn onClick={this.OnMessageClick} tabIndex={0} aria-label={t(goToMessageInfo)}>
          <JuiIconography>chat_bubble</JuiIconography>
          Message
        </StyledMessageBtn>
      </JuiGroupProfileBody>
    );
  }
}
const ProfileBodyView = translate('translations')(ProfileBody);
export { ProfileBodyView };
