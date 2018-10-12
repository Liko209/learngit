/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-19 14:51:28
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiSearchItem } from 'jui/pattern/ContactSearch/SearchItem';
import { JuiSearchItemText } from 'jui/pattern/ContactSearch/SearchItemText';

import { Avatar } from '../Avatar';

const ContactSearchItem = (props: any) => {
  const { suggestion, isHighlighted, ...rest } = props;
  return suggestion ? (
    <JuiSearchItem {...rest} selected={isHighlighted}>
      <Avatar uid={rest.uid} />
      <JuiSearchItemText
        primary={suggestion.label}
        secondary={suggestion.email}
      />
    </JuiSearchItem>
  ) : null;
};

export { ContactSearchItem };
