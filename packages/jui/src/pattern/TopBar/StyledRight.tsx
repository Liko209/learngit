/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 17:42:47
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { width } from '../../foundation/utils';

import { JuiAvatarActions } from './AvatarActions';
import { StyledMoreIconButton } from './StyledMoreIconButton';

const StyledRight = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (min-width: 1280px) {
    width: ${width(66)};
  }

  @media (min-width: 1101px) and (max-width: 1279px) {
    flex: 1;
  }

  @media (max-width: 1100px) {
    width: ${width(33)};
  }

  @media (max-width: 600px) {
    /* ${JuiAvatarActions} {
      display: none;
    } */
    width: auto;
  }
  /* @media (min-width: 601px) {
    ${StyledMoreIconButton} {
      display: none;
    }
  } */
`;

StyledRight.displayName = 'StyledRight';

export { StyledRight };
