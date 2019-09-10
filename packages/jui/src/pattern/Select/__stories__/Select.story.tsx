/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-21 17:43:53
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { storiesOf } from '@storybook/react';
import { text, boolean, number } from '@storybook/addon-knobs';
import { JuiSelect } from '../Select';
import React, { useState } from 'react';

storiesOf('Pattern/Select', module).add('Select', () => {
  const isDisabled = () => boolean('disabled', false);
  const useVirtualizedList = () => boolean('useVirtualizedList', false);
  const itemCount = number('itemCount', 100);
  const source = _.range(0, itemCount).map(i => ({
    id: i,
    label: `index-${i}`,
  }));
  const showSubAction = () => boolean('showSubAction', true);
  type Value = { id: number; label: string };
  const config = {
    id: 'test',
    useVirtualizedList: useVirtualizedList(),
    valueRenderer: ({ value }: { value: Value }) => value.label,
    secondaryActionRenderer: showSubAction()
      ? ({ value }: { value: Value }) => <b>{value.label}</b>
      : undefined,
  };
  const Demo = () => {
    const [value, setValue] = useState(source[0]);
    return (
      <JuiSelect
        rawValue={value}
        disabled={isDisabled()}
        source={source}
        config={config}
        handleChange={(newValue, rawValue: Value) => setValue(rawValue)}
      />
    );
  };
  return <Demo />;
});
