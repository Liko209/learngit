/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:40:33
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import styled from '../../../foundation/styled-components';
import { JuiMenuItem } from '../../Menus/MenuItem';
import { JuiVirtualizedBoxSelect } from '../VirtualizedBoxSelect';

const Wrapper = styled.div`
  padding: 100px;
`;

storiesOf('Components/VirtualizedSelects', module).add(
  'VirtualizedBoxSelect',
  () => {
    const itemCount = number('itemCount', 1000);

    const Demo = () => {
      const disabledIndexes = [5];
      const items = _.range(0, itemCount).map(index => (
        <JuiMenuItem
          disabled={disabledIndexes.includes(index)}
          key={`item_${index}`}
          searchString={`${index}-Item`}
          value={`${index}-Item`}
        >
          {index}-Item
        </JuiMenuItem>
      ));

      const [value, setValue] = useState('0-Item');

      return (
        <Wrapper>
          <JuiVirtualizedBoxSelect
            value={value}
            onChange={(e: any) => setValue(e.target.value)}
          >
            {items}
          </JuiVirtualizedBoxSelect>
        </Wrapper>
      );
    };
    return <Demo />;
  },
);
