/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-12 09:59:42
 * Copyright © RingCentral. All rights reserved.
 */

import Select, { SelectProps } from '@material-ui/core/Select';
import styled from '../../../foundation/styled-components';
import { grey, spacing } from '../../../foundation/utils';

const CLASSES_SELECT = {
  root: 'root',
  icon: 'icon',
  selectMenu: 'selectMenu',
};

const StyledSelect = styled<SelectProps>(Select)`
  && {
    max-width: ${spacing(58)};
  }
  .root {
    height: 100%;
  }
  .icon {
    color: ${grey('500')};
  }
  .selectMenu {
    padding: ${spacing(1.5, 6, 1.5, 2)};
    height: 100%;
    width: inherit;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }
`;

export { StyledSelect, CLASSES_SELECT };
