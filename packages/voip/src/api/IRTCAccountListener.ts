/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import { AccountState } from './types';

interface IRTCAccountListener {
  onAccountStateChanged(
    updateState: AccountState,
    originalState: AccountState,
  ): void;
}

export { IRTCAccountListener };
