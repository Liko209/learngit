import styled from '../../foundation/styled-components';
import { darken } from '@material-ui/core/styles/colorManipulator';

const JuiConversationPageMember = styled.div`
  ${({
    theme: {
      typography,
      palette: { grey },
    },
  }) => {
    const color = grey['500'];

    return `
      display: inline-flex;
      flex: none;
      align-self: center;
      align-items: center;
      padding-left: 12px;
      color: ${color};
      cursor: pointer;

      > span {
        ${typography['caption1']};
      }

      :hover {
        color: ${darken(color, 0.2)};
      }
    `;
  }}
`;

export { JuiConversationPageMember };
