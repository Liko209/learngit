/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-01 18:35:18
 * Copyright © RingCentral. All rights reserved.
 */
const ITEM_HEIGHT = 52;
const PINED_ITEM_HEIGHT = 56;
const HEADER_HEIGHT = 36;
const INITIAL_DATA_COUNT = 20;
const LOADING_DELAY = 500;
const LOAD_MORE_STRATEGY_CONFIG: Readonly<{
  threshold: number;
  minBatchCount: number;
}> = {
  threshold: 40,
  minBatchCount: 10,
};

export {
  PINED_ITEM_HEIGHT,
  ITEM_HEIGHT,
  HEADER_HEIGHT,
  LOAD_MORE_STRATEGY_CONFIG,
  INITIAL_DATA_COUNT,
  LOADING_DELAY,
};
