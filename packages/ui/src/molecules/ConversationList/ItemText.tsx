import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const ItemText = styled(Typography)`
&& {
  flex: 1;
  padding: 0 8px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
}
`;

export { ItemText };
export default ItemText;
