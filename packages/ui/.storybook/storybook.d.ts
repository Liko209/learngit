import { RenderFunction } from '@storybook/react';

declare module '@storybook/react' {
  export interface Story {
    addWithJSX(storyName: string, callback: RenderFunction): this;
  }
}
