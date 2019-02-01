/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiListItemSecondaryActionProps = {};

const JuiListItemSecondaryAction = styled.div`
  && {
    margin: ${spacing(0, 2)};
    a,
    button {
      margin-right: 0;
    }
  }
`;

JuiListItemSecondaryAction.displayName = 'JuiListItemSecondaryAction';

export { JuiListItemSecondaryAction, JuiListItemSecondaryActionProps };
