/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 15:03:20
 * Copyright © RingCentral. All rights reserved.
 */
// tslint:disable:no-console
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { JuiTextField } from '../';

const TextFieldStories = () => {
  const [values, setValues] = React.useState({
    name: 'Team name',
    age: '',
  });
  const handleChange = (name: any) => (event: any) => {
    setValues({ ...values, [name]: event.target.value });
  };
  return (
    <div>
      <section>
        <p>default</p>
        <JuiTextField
          id="TeamName"
          label="Team name"
          fullWidth={true}
          onKeyDown={handleChange('name')}
          InputProps={{
            classes: {
              root: 'root',
            },
          }}
          inputProps={{
            maxLength: 200,
          }}
          helperText={'Team name required'}
        />
      </section>
      <section>
        <p>type="number" use aria-label for control</p>
        <JuiTextField
          id="outlined-number"
          label=""
          type="number"
          value={values.age}
          onChange={handleChange('age')}
          inputProps={{
            'aria-label': 'numberInput',
          }}
        />
      </section>
    </div>
  );
};

storiesOf('Components/Forms', module).add('TextField', () => (
  <TextFieldStories />
));
