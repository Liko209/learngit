import styled from '../../foundation/styled-components';
import { grey, height, palette, spacing, typography, width } from '../../foundation/utils';

const StyledGuestIdentifier = styled.span`
  width: ${width(12)};
  height: ${height(4)};
  color: ${palette('common', 'white')};
  background-color: ${grey('400')};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  line-height: ${height(4)};
  text-align: center;
  ${typography('caption1')};
  margin-left: ${spacing(3)};
`;
const StyledAdminIdentifier = styled(StyledGuestIdentifier)`
  background-color: ${palette('secondary', 'main')};
`;
export { StyledGuestIdentifier, StyledAdminIdentifier };
