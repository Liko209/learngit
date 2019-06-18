import React from 'react';
import { MemoryRouter } from 'react-router';
import { mountWithTheme } from 'shield/utils';
import { container, Jupiter } from 'framework';
import { App } from '../../app/container';
import * as app from '../../app/module.config';
import * as router from '../../router/module.config';

beforeAll(() => {
  const jupiter = container.get(Jupiter);
  jupiter.registerModule(router.config);
  jupiter.registerModule(app.config);
});

describe('test', () => {
  it('should run', () => {
    const wrapper = mountWithTheme(
      <MemoryRouter initialEntries={['/random']}>
        <App />
      </MemoryRouter>,
    );
  });
});
