/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 15:36:51
 * Copyright © RingCentral. All rights reserved.
 */

import { Progress } from 'sdk/module/progress';
import { PROGRESS_STATUS } from 'sdk/module/progress';
import ProgressModel from '../Progress';

describe('ProgressModel', () => {
  it('should get need property from Progress', () => {
    const model = ProgressModel.fromJS({
      id: -1,
      rate: { loaded: 10, total: 100 },
      status: PROGRESS_STATUS.CANCELED,
    });
    expect(model.id).toBe(-1);
    expect(model.rate).toMatchObject({ loaded: 10, total: 100 });
    expect(model.progressRate).toMatchObject({ loaded: 10, total: 100 });
    expect(model.status).toBe(PROGRESS_STATUS.CANCELED);
    expect(model.progressStatus).toBe(PROGRESS_STATUS.CANCELED);
  });

  it('should return SUCCESS when id > 0 ', () => {
    const model = ProgressModel.fromJS({
      id: 1,
      rate: { loaded: 10, total: 100 },
      status: PROGRESS_STATUS.CANCELED,
    });
    expect(model.progressStatus).toBe(PROGRESS_STATUS.SUCCESS);
  });

  it('should return FAILED when id < 0 and has no status ', () => {
    const model = ProgressModel.fromJS({
      id: -1,
      rate: { loaded: 10, total: 100 },
    });
    expect(model.progressStatus).toBe(PROGRESS_STATUS.FAIL);
  });
});
