import { width, palette } from '../../foundation/utils';
import styled from '../../foundation/styled-components';

const StyledProfileView = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const StyledBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: ${width(3)} solid ${palette('common', 'white')};
  box-shadow: ${({ theme }) => theme.boxShadow.val2};
`;
export { StyledProfileView, StyledBottomBar };
