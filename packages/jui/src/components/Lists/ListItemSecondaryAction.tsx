/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';

type JuiListItemSecondaryActionProps = {};

const JuiListItemSecondaryAction = styled.div`
  && {
    button {
      margin-right: 0;
    }
  }
`;

JuiListItemSecondaryAction.displayName = 'JuiListItemSecondaryAction';

export { JuiListItemSecondaryAction, JuiListItemSecondaryActionProps };
