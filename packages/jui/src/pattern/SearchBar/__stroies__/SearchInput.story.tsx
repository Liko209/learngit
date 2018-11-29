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
import { JuiSearchInput } from '../';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { text, boolean } from '@storybook/addon-knobs';

storiesOf('Pattern/SearchBar', module)
  .addDecorator(withInfoDecorator(JuiSearchInput, { inline: true }))
  .add('SearchInput', () => {
    const focus = boolean('focus', false);
    return (
      <div>
        <JuiSearchInput
          focus={focus}
          value=""
          onChange={() => {}}
          onClear={() => {}}
        />
      </div>
    );
  });
