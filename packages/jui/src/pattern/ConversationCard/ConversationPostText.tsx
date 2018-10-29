import styled from '../../foundation/styled-components';
import { grey, height, width, spacing } from '../../foundation/utils/styles';

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
  .emoji {
    width: ${height(5)};
    height: ${width(5)};
    padding: 0 ${spacing(0.25)};
    vertical-align: middle;
  }
  .emoji.enlarge-emoji {
    width: ${height(7.5)};
    height: ${height(7.5)};
    padding: 0;
  }
`;
export { JuiConversationPostText };
