/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { ID_TYPE } from '../types';
import { JuiGroupProfileBody } from 'jui/pattern/GroupTeamProfile';
import { GroupAvatar } from '@/containers/Avatar/GroupAvatar';
import { Avatar } from '@/containers/Avatar';
import { ProfileHeaderViewProps } from './types';
import { JumpToConversation } from '../../JumpToConversation';
import { JuiIconography } from 'jui/foundation/Iconography';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';

const StyledMessageBtn = styled.div`
  display: flex;
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  span {
    font-size: ${({ theme }) => theme.typography.h6.fontSize};
    margin-right: ${spacing(3)};
  }
`;
@observer
class ProfileBody extends React.Component<ProfileHeaderViewProps> {
  renderMessageBtn = () => {
    return (
      <StyledMessageBtn>
        <JuiIconography>chat_bubble</JuiIconography>
        Message
      </StyledMessageBtn>
    );
  }
  render() {
    const { displayName, description, id, idType, destroy } = this.props;
    const message = <JumpToConversation id={id} onSuccess={destroy}>{this.renderMessageBtn()}</JumpToConversation>;
    let avatar;
    if (idType === ID_TYPE.GROUP || idType === ID_TYPE.TEAM) {
      avatar = <GroupAvatar cid={id} />;
    } else if (idType === ID_TYPE.PERSON) {
      avatar = <Avatar uid={id} />;
    }
    return (
      <JuiGroupProfileBody
        avatar={avatar}
        displayName={displayName}
        description={description}
      >
        {message}
      </JuiGroupProfileBody>
    );
  }
}
const ProfileBodyView = translate('translations')(ProfileBody);
export { ProfileBodyView };
