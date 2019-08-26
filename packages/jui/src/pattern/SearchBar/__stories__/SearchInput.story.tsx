/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-26 11:58:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiSearchInput } from '..';

import avatar from './img/avatar.jpg';

const defaultProps = {
  clearText: 'clear',
  size: 'medium' as any,
  withCloseIcon: false,
  value: 'searchKey',
  onClear: () => {},
};

storiesOf('Pattern/SearchInput', module)
  .add('medium', () => {
    return <JuiSearchInput {...defaultProps} />;
  })
  .add('large', () => {
    return <JuiSearchInput {...defaultProps} size="large" />;
  })
  .add('empty', () => {
    return <JuiSearchInput {...defaultProps} size="large" value="" />;
  });
