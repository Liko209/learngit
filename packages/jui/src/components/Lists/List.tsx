/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiList, { ListProps as MuiListProps } from '@material-ui/core/List';
import styled from '../../foundation/styled-components';
import { width } from 'src/foundation/utils';

type JuiListProps = MuiListProps;

const JuiList = styled(MuiList)`
  width: ${width(67)};
`;

JuiList.displayName = 'JuiList';

export { JuiList, JuiListProps };
