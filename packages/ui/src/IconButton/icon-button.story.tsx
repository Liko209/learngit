/// <reference path="../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';

import IconButton from './';

const knobs = {
  size: () => select(
    'size',
    {
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    'medium',
  ),
  invisible: () => boolean('invisible', false),
  awake: () => boolean('awake', false),
  active: () => boolean('active', false),
  disabled: () => boolean('disabled', false),
};
storiesOf('IconButton', module)
  .addDecorator((storyFn) => {
    return <div style={{ textAlign: 'center' }}>{storyFn()}</div>;
  })
  .addWithJSX('filled', withInfo(``)(() => {
    return (
      <div>
        <IconButton
          size={knobs.size()}
          awake={knobs.awake()}
          active={knobs.active()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
        >
          star
        </IconButton>
        <br />
        <br />
        <IconButton
          size={knobs.size()}
          awake={knobs.awake()}
          active={knobs.active()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          favorite
        </IconButton>
      </div>
    );
  }))
  .addWithJSX('outlined', withInfo(``)(() => {
    return (
      <div>
        <IconButton
          size={knobs.size()}
          awake={knobs.awake()}
          active={knobs.active()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
        >
          {knobs.active() ? 'star' : 'star_border'}
        </IconButton>
        <br />
        <br />
        <IconButton
          size={knobs.size()}
          awake={knobs.awake()}
          active={knobs.active()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          {knobs.active() ? 'favorite' : 'favorite_border'}
        </IconButton>
      </div>
    );
  }));
