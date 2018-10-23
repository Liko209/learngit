import React from 'react';
import { observer } from 'mobx-react';
import { JuiDivider } from 'jui/components/Divider';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardFooter,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { translate } from 'react-i18next';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';
import { Actions } from '@/containers/ConversationCard/Actions';
import styled from 'jui/foundation/styled-components';
import { Markdown } from 'glipdown';
import { glipdown2Html } from '@/utils/glipdown2Html';
import { html2React } from '@/utils/html2React';
import { grey } from 'jui/foundation/utils/styles';

type PostText = {
  currentUserId: number;
  atMentionId: string|number;
};
const StyledPostText = styled<PostText, 'div'>('div')`
  font-size: ${({ theme }) => theme.typography.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body2.lineHeight};
  color: ${grey('700')};
  word-wrap: break-word;
  white-space: pre-wrap;
  a {
    color: ${({ theme }) => theme.palette.primary.light};
  }
  .at_mention_compose{
    color: ${({ theme, atMentionId, currentUserId }) => +atMentionId === currentUserId ? grey('900') : theme.palette.primary.main};
    cursor: pointer;
    font-weight: ${({ theme }) => theme.typography.body2.lineHeight};
    background-color: ${({ theme, atMentionId, currentUserId }) => +atMentionId === currentUserId ? theme.palette.secondary['100'] : theme.palette.background.paper};
  }
`;
@observer
export class ConversationCard extends React.Component<
  ConversationCardViewProps
> {
  constructor(props: ConversationCardViewProps) {
    super(props);
  }
  render() {
    const { id, post, creator, displayTitle, createTime, kv, currentUserId } = this.props;
    const { text } = post;
    const str1 = Markdown(text);
    const str2 = glipdown2Html(str1);
    const html = html2React(str2, kv);
    const atMentionId = Object.keys(kv)[0] || 0;
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
            name={displayTitle}
            time={createTime}
          >
            <Actions id={id} />
          </JuiConversationCardHeader>
          {/* todo: content */}
          <StyledPostText currentUserId={currentUserId} atMentionId={atMentionId}>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </StyledPostText>
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

const ConversationCardView = translate('Conversations')(ConversationCard);

export { ConversationCardView };
