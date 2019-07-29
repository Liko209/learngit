/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-31 09:43:01
 * Copyright © RingCentral. All rights reserved.
 */

import { execQuery } from '../queryExecutor';
import {
  extractLokiResultSetToIds,
  extractLokiResultSetToFirstNames,
  extractLokiResultSets,
  setupLoki,
} from '../../__tests__/utils';
import { runQueryExecutorTests } from '../../__tests__/queryExecutorTestHelper';

runQueryExecutorTests({
  execQuery,
  setup: async () => {
    const { collection } = await setupLoki();
    return collection;
  },
  extractResultsToIds: extractLokiResultSetToIds,
  extractResultsToFirstNames: extractLokiResultSetToFirstNames,
  extractResults: extractLokiResultSets,
});
