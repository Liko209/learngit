import React from 'react';
import { observer } from 'mobx-react';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardBody,
  JuiConversationPostText,
  // JuiConversationCardFooter,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { translate } from 'react-i18next';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';
import { Actions } from '@/containers/ConversationCard/Actions';
import { Markdown } from 'glipdown';
import { glipdown2Html } from '@/utils/glipdown2Html';
import { handleAtMentionName } from '@/utils/handleAtMentionName';

@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  constructor(props: ConversationCardViewProps) {
    super(props);
  }
  render() {
    const {
      id,
      post,
      creator,
      name,
      createTime,
      customStatus,
      atMentionIdMaps,
      currentUserId,
    } = this.props;
    const { text } = post;
    const toMdString = Markdown(text);
    const toHtmlString = glipdown2Html(toMdString);
    const html = handleAtMentionName(toHtmlString, atMentionIdMaps);
    const atMentionId =
      Object.keys(atMentionIdMaps).filter(id => +id === currentUserId)[0] || 0;
    const avatar = <Avatar uid={creator.id} size="medium" />;
    return (
      <React.Fragment>
        <JuiConversationCard
          data-name="conversation-card"
          data-id={post.id}
          Avatar={avatar}
        >
          <JuiConversationCardHeader
            data-name="conversation-card-header"
            name={name}
            time={createTime}
            status={customStatus}
          >
            <Actions id={id} />
          </JuiConversationCardHeader>
          <JuiConversationCardBody>
            <JuiConversationPostText
              currentUserId={currentUserId}
              atMentionId={atMentionId}
            >
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </JuiConversationPostText>
          </JuiConversationCardBody>
          {/*<JuiConversationCardFooter>*/}
          {/*/!* todo: footer *!/*/}
          {/*</JuiConversationCardFooter>*/}
        </JuiConversationCard>
      </React.Fragment>
    );
  }
}

const ConversationCardView = translate('Conversations')(ConversationCard);

export { ConversationCardView };
