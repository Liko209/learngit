/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-27 08:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { RuiSuffixFollowTextField } from '../';

storiesOf('Forms', module).add('SuffixFollowTextField', () => {
  const suffixText = text('suffix', '.pdf');

  const SuffixFollowTextField = () => {
    const [value, setValue] = useState('');
    const handleInputChange = (event: any) => {
      if (event.target) {
        const value = event.target.value || '';
        setValue(value);
      }
    };

    return (
      <section>
        <RuiSuffixFollowTextField
          id="suffixFollow"
          label="suffixFollow"
          fullWidth={true}
          InputProps={{
            classes: {
              root: 'root',
            },
          }}
          inputProps={{
            maxLength: 200,
          }}
          suffix={suffixText}
          onChange={handleInputChange}
        />
        <div style={{ marginTop: '10px' }}>value: {value}</div>
      </section>
    );
  };

  return <SuffixFollowTextField />;
});
