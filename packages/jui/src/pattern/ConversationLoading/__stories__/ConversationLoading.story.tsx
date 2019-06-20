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
import { JuiConversationLoading } from '../';
import { text, boolean } from '@storybook/addon-knobs';

storiesOf('Pattern/ConversationLoading', module).add(
  'JuiConversationLoading',
  () => {
    const tip = text('tip', 'loading');
    const linkText = text('linkText', 'www.google.com');
    const showTip = boolean('showTip', true);
    class Test extends React.PureComponent {
      render() {
        return (
          <div>
            <JuiConversationLoading
              tip={tip}
              showTip={showTip}
              linkText={linkText}
              onClick={() => {}}
            />
          </div>
        );
      }
    }
    return <Test />;
  },
);
