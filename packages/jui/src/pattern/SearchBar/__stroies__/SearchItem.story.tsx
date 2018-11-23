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
import { JuiSearchItem } from '../';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiAvatar } from '../../../components/Avatar';
import { text } from '@storybook/addon-knobs';

storiesOf('Pattern/SearchBar', module)
  .addDecorator(withInfoDecorator(JuiSearchItem, { inline: true }))
  .add('JuiSearchItem', () => {
    return (
      <JuiSearchItem
        avatar={
          <JuiAvatar
            size="small"
            src="http://tvax2.sinaimg.cn/crop.11.0.1103.1103.180/6c546c01ly8flmqvtjhycj20v90undhk.jpg"
          />
        }
      />
    );
  });
