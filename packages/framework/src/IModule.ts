/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-04 12:17:15
 * Copyright © RingCentral. All rights reserved.
 */
interface IModule {
  bootstrap: () => Promise<void> | void;
  dispose?: () => Promise<void> | void;
}

export { IModule };
