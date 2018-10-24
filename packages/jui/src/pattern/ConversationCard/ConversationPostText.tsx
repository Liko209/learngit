import styled from '../../foundation/styled-components';
import { grey } from '../../foundation/utils/styles';

type PostText = {
  currentUserId: number;
  atMentionId: string|number;
};
const JuiConversationPostText = styled<PostText, 'div'>('div')`
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
export { JuiConversationPostText };
