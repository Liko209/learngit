/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-05 16:00:42
 * Copyright © RingCentral. All rights reserved.
 */
/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiRightRailLoading } from '../';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

storiesOf('Pattern/ConversationLoading', module)
  .addDecorator(withInfoDecorator(JuiRightRailLoading, { inline: true }))
  .add('JuiRightRailLoading', () => {
    class Test extends React.PureComponent {
      render() {
        return (
          <div>
            <JuiRightRailLoading />
          </div>
        );
      }
    }
    return <Test />;
  });
