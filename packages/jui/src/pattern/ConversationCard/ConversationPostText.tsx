import styled from '../../foundation/styled-components';
import {
  grey,
  height,
  width,
  spacing,
  primary,
  palette,
  typography,
} from '../../foundation/utils/styles';

const JuiConversationPostText = styled('div')`
  ${typography('body1')}
  color: ${grey('900')};
  word-wrap: break-word;
  white-space: pre-wrap;
  a {
    color: ${palette('primary', 'light')};
    &:hover {
      text-decoration: underline;
    }
  }
  .at_mention_compose {
    display: inline;
    padding: 0;
    border: none;
    background: none;
    ${typography('body1')};
    font-weight: ${({ theme }) => theme.typography.body2.fontWeight};
    color: ${palette('primary', 'main')};
    cursor: pointer;

    :active {
      outline: none;
    }

    :hover {
      text-decoration: underline;
    }
  }
  .current {
    color: ${grey('900')};
    background-color: ${palette('secondary', '100')};
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
  q {
    display: block;
    border-left: 1px solid ${primary('700')};
    background-color: ${grey('100')};
    color: ${grey('700')};
    padding: ${spacing(1.5)} ${spacing(1.5)} ${spacing(1.5)} ${spacing(4)};
    margin: ${spacing(1)} 0 ${spacing(2)};
    &::before, &::after {
      content: '';
    }
  }
`;
export { JuiConversationPostText };
