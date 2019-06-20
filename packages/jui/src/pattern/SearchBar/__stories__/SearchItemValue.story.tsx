/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:45:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, array } from '@storybook/addon-knobs';
import { JuiSearchItemValue } from '../';

storiesOf('Pattern/SearchBar', module).add('JuiSearchItemValue', () => {
  const value = text('value', 'abcdefg');
  const terms = array('array', ['a', 'c', 'fg']);
  return (
    <div>
      <JuiSearchItemValue value={value} terms={terms} />
    </div>
  );
});
