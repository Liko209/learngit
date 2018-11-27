import styled from '../../foundation/styled-components';
import { grey, height, spacing, typography } from '../../foundation/utils';

const StyledTitle = styled.p`
  ${typography('subheading')};
  color: ${grey('900')};
  height: ${height(12.5)};
  margin: 0 0 0 ${spacing(6)};
  line-height: ${height(12.5)};
`;
export { StyledTitle };
