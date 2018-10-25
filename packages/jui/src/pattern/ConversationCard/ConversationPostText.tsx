import styled from '../../foundation/styled-components';
import { grey } from '../../foundation/utils/styles';

const JuiConversationPostText = styled('div')`
  font-size: ${({ theme }) => theme.typography.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body2.lineHeight};
  color: ${grey('700')};
  word-wrap: break-word;
  white-space: pre-wrap;
  a {
    color: ${({ theme }) => theme.palette.primary.light};
  }
  .at_mention_compose {
    color: ${({ theme }) => theme.palette.primary.main};
    cursor: pointer;
    font-weight: ${({ theme }) => theme.typography.body2.fontWeight};
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
  .current {
    color: ${grey('900')};
    background-color: ${({ theme }) => theme.palette.secondary['100']}
  }
`;
export { JuiConversationPostText };
