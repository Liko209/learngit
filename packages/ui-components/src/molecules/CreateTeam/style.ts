/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-13 13:41:24
 * Copyright © RingCentral. All rights reserved.
 */
import styled from 'styled-components';
import MuiList from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MuiListItemText from '@material-ui/core/ListItemText';
import MuiTypography from '@material-ui/core/Typography';
import MuiTextField from '@material-ui/core/TextField';

import { spacing, grey, typography, palette } from '../../utils/styles';

const TextField = styled(MuiTextField)`
  && {
    margin: 0 0 ${({ theme }) => spacing(2)} 0;
  }
  .underline {
    &:after {
      border-bottom-color: ${({ theme }) => palette('primary', 'main')};
    }
  }
`;

const List = styled(MuiList)`
  && {
    padding: 0;
    margin: ${({ theme }) => spacing(3)} 0 ${({ theme }) => spacing(5)};
  }
`;

const ListItem = styled(MuiListItem)`
  && {
    padding: 0;
    margin: 0 0 ${({ theme }) => spacing(4)} 0;
  }
`;

const ListItemSecondaryAction = styled(MuiListItemSecondaryAction)`
  && {
    right: 0;
  }
`;

const ListItemText = styled(MuiListItemText)`
  && {
    color: ${grey('900')};
    ${typography('body1')};
  }
`;

const ListTips = styled(MuiTypography)`
  && {
    color: ${grey('700')};
    ${typography('caption')};
  }
`;

export {
  TextField,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListTips,
};
