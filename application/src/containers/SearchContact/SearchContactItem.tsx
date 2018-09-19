/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 14:51:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import JuiSearchItem from 'ui-components/molecules/SearchItem';
import JuiSearchItemText from 'ui-components/atoms/SearchItemText';

import JuiAvatar from 'ui-components/atoms/Avatar';

const SearchContactItem = (props: any) => {
  const { suggestion, ...rest } = props;
  return (
    <JuiSearchItem {...rest} key={suggestion.label}>
      <JuiAvatar />
      <JuiSearchItemText
        primary={suggestion.label}
        secondary={suggestion.email}
      />
    </JuiSearchItem>
  );
};

export default observer(SearchContactItem);
