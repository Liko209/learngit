/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListItem, {
  ListItemProps as MuiListItemProps,
} from '@material-ui/core/ListItem';
import styled from '../../foundation/styled-components';
import { grey } from '../../foundation/utils/styles';

type JuiListItemProps = MuiListItemProps;

const JuiListItem = styled(MuiListItem)`
  && {
    white-space: nowrap;
    background: white;
    color: ${grey('900')};
    /**
   * Workaround to resolve transition conflicts with react-sortable-hoc
   * Details at https://github.com/clauderic/react-sortable-hoc/issues/334
   */
    transition: transform 0s ease,
      background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  }

  &&:hover {
    background: ${grey('100')};
  }

  &&:focus {
    background: ${grey('300')};
  }
`;

JuiListItem.displayName = 'JuiListItem';

export { JuiListItem, JuiListItemProps };
