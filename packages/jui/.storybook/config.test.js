/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:41:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  storiesOf,
  configure,
  addDecorator,
  addParameters,
} from '@storybook/react';
import {
  Global,
  ThemeProvider,
  themes,
  createReset,
  convert,
} from '@storybook/theming';

import { ThemeProvider as JuiThemeProvider } from '../src/foundation/theme/index';
import './index.css';

const ThemeDecorator = storyFn => {
  return (
    <JuiThemeProvider themeName='light'>
      <ThemeProvider theme={convert(themes.light)}>
        <Global styles={createReset} />
        <div
          id='component'
          style={{
            padding: '20px',
            maxWidth: 'fit-content',
            maxHeight: 'fit-content',
          }}
        >
          {storyFn()}
        </div>
      </ThemeProvider>
    </JuiThemeProvider>
  );
};

addDecorator(ThemeDecorator);

addParameters({
  info: {
    disable: true,
  },
});

let previousExports = {};
if (module && module.hot && module.hot.dispose) {
  ({ previousExports = {} } = module.hot.data || {});

  module.hot.dispose(data => {
    // eslint-disable-next-line no-param-reassign
    data.previousExports = previousExports;
  });
}

// The simplest version of examples would just export this function for users to use
function importAll(context) {
  const storyStore = window.__STORYBOOK_CLIENT_API__._storyStore; // eslint-disable-line no-undef, no-underscore-dangle

  context.keys().forEach(filename => {
    const fileExports = context(filename);

    // A old-style story file
    if (!fileExports.default) {
      return;
    }

    const { default: component, ...examples } = fileExports;
    let componentOptions = component;
    if (component.prototype && component.prototype.isReactComponent) {
      componentOptions = { component };
    }
    const kindName =
      componentOptions.title || componentOptions.component.displayName;

    if (previousExports[filename]) {
      if (previousExports[filename] === fileExports) {
        return;
      }

      // Otherwise clear this kind
      storyStore.removeStoryKind(kindName);
      storyStore.incrementRevision();
    }

    // We pass true here to avoid the warning about HMR. It's cool clientApi, we got this
    const kind = storiesOf(kindName, true);

    (componentOptions.decorators || []).forEach(decorator => {
      kind.addDecorator(decorator);
    });
    if (componentOptions.parameters) {
      kind.addParameters(componentOptions.parameters);
    }

    Object.keys(examples).forEach(key => {
      const example = examples[key];
      const { title = key, parameters } = example;
      kind.add(title, example, parameters);
    });

    previousExports[filename] = fileExports;
  });
}

function loadStories() {
  const req = require.context('../src/foundation', true, /\.story\.tsx?$/);
  importAll(req);
}

configure(loadStories, module);
