import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardBody,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';
import { ProgressActions } from '@/containers/ConversationCard/ProgressActions';
import { Actions } from '@/containers/ConversationCard/Actions';
import { Footer } from '@/containers/ConversationCard/Footer';
import { idsToConversationSheet } from '@/containers/ConversationSheet';
import { TextMessage } from '@/containers/ConversationSheet/TextMessage';
// import { idToPostItemComponent } from '@/containers/PostItems';
@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  state = {
    isHover: false,
  };
  handleMouseEnter = () => {
    this.setState({
      isHover: true,
    });
  }

  handleMouseLeave = () => {
    this.setState({
      isHover: false,
    });
  }

  render() {
    const {
      id,
      creator,
      name,
      createTime,
      customStatus,
      showProgressActions,
      itemIds,
    } = this.props;
    const { isHover } = this.state;
    if (!creator.id) {
      return null;
    }

    const avatar = <Avatar uid={creator.id} size="medium" data-name="avatar" />;

    return (
      <React.Fragment>
        <JuiConversationCard
          data-name="conversation-card"
          data-id={id}
          Avatar={avatar}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          <JuiConversationCardHeader
            data-name="header"
            name={name}
            time={createTime}
            status={customStatus}
          >
            {showProgressActions ? <ProgressActions id={id} /> : null}
            {!showProgressActions && isHover ? <Actions id={id} /> : null}
          </JuiConversationCardHeader>
          <JuiConversationCardBody data-name="body">
            <TextMessage id={id} />
            {idsToConversationSheet(itemIds)}
          </JuiConversationCardBody>
          <Footer id={id} />
        </JuiConversationCard>
      </React.Fragment>
    );
  }
}

const ConversationCardView = ConversationCard;

export { ConversationCardView };
