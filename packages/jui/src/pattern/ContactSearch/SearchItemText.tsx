/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 09:41:42
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import ListItemText, {
  ListItemTextProps,
} from '@material-ui/core/ListItemText';
import { typography, height, spacing } from '../../foundation/utils/styles';

const StyledListItemText = styled(ListItemText)`
  && {
    padding-left: ${spacing(3)};
  }
  .primary {
    ${typography('body1')};
    height: ${height(5)};
  }
  .secondary {
    ${typography('caption1')};
    height: ${height(4)};
  }
`;

const JuiSearchItemText: React.SFC<ListItemTextProps> = memo(
  (props: ListItemTextProps) => {
    const { innerRef, ...rest } = props;
    return (
      <StyledListItemText
        classes={{ primary: 'primary', secondary: 'secondary' }}
        {...rest}
      />
    );
  },
);

export { JuiSearchItemText };
