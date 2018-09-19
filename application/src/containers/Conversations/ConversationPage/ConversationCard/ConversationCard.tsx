import React from 'react';
import { ENTITY_NAME } from '@/store';
import { observer } from 'mobx-react';
import { JuiDivider } from 'ui-components/atoms/Divider';
import injectStore, { IInjectedStoreProps } from '@/store/inject';
import StoreViewModel from '@/store/ViewModel';
import PostModel from '@/store/models/Post';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardFooter,
} from 'ui-components/organisms/ConversationCard';
import moment from 'moment';
import { Post, Person } from 'sdk/src/models';
import PersonModel from '@/store/models/Person';
import { getEntity } from '@/store/utils';
import { Avatar } from '../../../Avatar/Avatar';
interface IProps extends IInjectedStoreProps<StoreViewModel> {
  id: number;
}

@observer
export class ConversationCard extends React.Component<IProps> {
  render() {
    const { id } = this.props;
    const post = getEntity<Post, PostModel>(ENTITY_NAME.POST, id);
    const creator = getEntity<Person, PersonModel>(
      ENTITY_NAME.PERSON,
      post.creatorId,
    );
    const { text, createdAt } = post;
    const { displayName, awayStatus } = creator;
    let nameWithStatus = displayName;
    if (awayStatus) {
      nameWithStatus += ` ${awayStatus}`;
    }

    const avatar = (
      <Avatar uId={creator.id} size="medium">
        SH
      </Avatar>
    );
    return (
      <React.Fragment>
        <JuiConversationCard Avatar={avatar}>
          <JuiConversationCardHeader
            name={nameWithStatus}
            time={moment(createdAt).format('hh:mm A')}
          />
          {/* todo: content */}
          <div
            style={{ fontSize: '14px', lineHeight: '24px', color: '#616161' }}
          >
            {text}
          </div>
          {/* todo: content */}
          <JuiConversationCardFooter>
            {/* todo: footer */}
          </JuiConversationCardFooter>
        </JuiConversationCard>
        <JuiDivider />
      </React.Fragment>
    );
  }
}

/* this should be removed once conversation card developed*/
export default injectStore(StoreViewModel)(ConversationCard);
