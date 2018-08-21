import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';
import createDependencies from '../../create-dependencies-doc';

import Button from './';

storiesOf('Buttons', module)
  .addWithJSX('Button', withInfo(`
    ${Button.dependencies ? createDependencies(Button.dependencies) : null}
  `)(
    () => {
      const size = select(
        'size',
        {
          small: 'small',
          medium: 'medium',
          large: 'large',
        },
        'medium',
      );
      const disabled = boolean('disabled', false);
      const disableRipple = boolean('disableRipple', false);
      const fullWidth = boolean('fullWidth', false);
      return (
        <Button
          color="primary"
          size={size}
          disabled={disabled}
          disableRipple={disableRipple}
          fullWidth={fullWidth}
        >
          Primary
        </Button>
      );
    },
  ));
