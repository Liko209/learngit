/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-09 16:37:53
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';

beforeEach(() => {
  container.snapshot();
});
afterEach(() => {
  container.restore();
});

function registerModule(config: Object) {
  const jupiter = container.get(Jupiter);
  jupiter.registerModule(config);
}

export { registerModule };
