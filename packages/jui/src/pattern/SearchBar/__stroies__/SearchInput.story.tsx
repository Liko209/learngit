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
import React, { ChangeEvent } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiSearchInput } from '../';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { boolean } from '@storybook/addon-knobs';

storiesOf('Pattern/SearchBar', module)
  .addDecorator(withInfoDecorator(JuiSearchInput, { inline: true }))
  .add('SearchInput', () => {
    const focus = boolean('focus', false);

    class Test extends React.PureComponent {
      state = {
        value: '',
      };
      onChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
          value: e.target.value,
        });
      }
      render() {
        return (
          <div>
            <JuiSearchInput
              focus={focus}
              value={this.state.value}
              placeholder="search"
              onChange={this.onChange}
              onClear={() => {}}
              showCloseBtn={true}
            />
          </div>
        );
      }
    }
    return <Test />;
  });
