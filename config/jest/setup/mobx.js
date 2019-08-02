/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-27 09:40:01
 * Copyright © RingCentral. All rights reserved.
 */
const mobx = require('mobx');
const _configure = mobx.configure;
mobx.configure = options =>
  _configure(
    Object.assign({}, options, {
      computedRequiresReaction: false,
    }),
  );
mobx.configure();
