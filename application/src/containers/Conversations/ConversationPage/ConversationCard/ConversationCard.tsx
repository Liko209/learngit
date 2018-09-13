import React from 'react';
import { ENTITY_NAME } from '@/store';
import { observer } from 'mobx-react';
import { JuiDivider } from 'ui-components';
import injectStore, { IInjectedStoreProps } from '@/store/inject';
import VM from '@/store/ViewModel';
import PostModel from '@/store/models/Post';
import { JuiConversationCard, JuiConversationCardHeader, JuiConversationCardFooter } from 'ui-components/organisms/ConversationCard';
import { JuiAvatar } from 'ui-components/atoms/Avatar';
import moment from 'moment';
import { Post, Person } from 'sdk/src/models';
import PersonModel from '@/store/models/Person';
interface IProps extends IInjectedStoreProps<VM> {
  id: number;
}

@observer
export class ConversationCard extends React.Component<IProps> {
  render() {
    const { id, getEntity } = this.props;
    const post = getEntity<Post, PostModel>(ENTITY_NAME.POST, id);
    const creator = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, post.creatorId);
    const {
      text,
      createdAt,
    } = post;
    const {
      displayName,
      awayStatus,
    } = creator;
    const nameWithStatus = `${displayName}${awayStatus ? ` ${awayStatus}` : ''}`;
    /**
     * Just a placeholder, should be replaced with a container instead. * <Avatar id={creator.id} size="medium" />
     */
    const avatar = <JuiAvatar size="medium">SH</JuiAvatar>;
    return (
      <React.Fragment>
        <JuiConversationCard Avatar={avatar}>
          <JuiConversationCardHeader name={nameWithStatus} time={moment(createdAt).format('hh:mm A')} />
          {/* todo: content */}
          <div style={{ fontSize: '14px', lineHeight: '24px', color: '#616161' }}>
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
export default injectStore(VM)(ConversationCard);
