import * as React from 'react';
import { RenderFunction } from '@storybook/react';

export default function alignCenterDecorator(story: RenderFunction) {
  return <div style={{ textAlign: 'center' }}> {story()}</div>;
}
