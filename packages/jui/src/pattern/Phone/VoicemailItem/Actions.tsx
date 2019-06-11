import styled from '../../../foundation/styled-components';
import { grey, spacing } from '../../../foundation/utils/styles';

const JuiActionIconWrapper = styled.div`
  background-color: ${grey('500')};
  border-radius: 50%;
  &:not(:last-child) {
    margin-right: ${spacing(2)};
  }
`;

export { JuiActionIconWrapper };
