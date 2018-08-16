/// <reference path="../../../.storybook/storybook.d.ts" />
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean, select } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';

import IconButton from '.';

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
  color: () => select(
    'color',
    {
      primary: 'primary',
      secondary: 'secondary',
    },
    'primary',
  ),
  invisible: () => boolean('invisible', false),
  awake: () => boolean('awake', false),
  disabled: () => boolean('disabled', false),
};
storiesOf('IconButton', module)
  .addDecorator((storyFn) => {
    return <div style={{ textAlign: 'center' }}>{storyFn()}</div>;
  })
  .addWithJSX('plain', withInfo(``)(() => {
    return (
      <div>
        <IconButton
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
        >
          add_circle
        </IconButton>
        <br />
        <br />
        <IconButton
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          remove_circle
        </IconButton>
        <br />
        <br />
        <IconButton
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
        >
          add_circle_outlined
        </IconButton>
        <br />
        <br />
        <IconButton
          variant="plain"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          remove_circle_outlined
        </IconButton>
      </div>
    );
  }))
  .addWithJSX('round', withInfo(``)(() => {
    return (
      <div>
        <IconButton
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
        >
          star
        </IconButton>
        <br />
        <br />
        <IconButton
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          favorite
        </IconButton>
        <br />
        <br />
        <IconButton
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="I'm a star"
        >
          star_border
        </IconButton>
        <br />
        <br />
        <IconButton
          variant="round"
          color={knobs.color()}
          size={knobs.size()}
          awake={knobs.awake()}
          disabled={knobs.disabled()}
          invisible={knobs.invisible()}
          tooltipTitle="like"
        >
          favorite_border
        </IconButton>
      </div>
    );
  }));
