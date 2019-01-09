/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-03 15:42:04
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../../framework/model';

enum PROGRESS_STATUS {
  SUCCESS,
  FAIL,
  INPROGRESS,
  CANCELED,
}

type Progress = IdModel & {
  rate?: { total: number; loaded: number };
  status?: PROGRESS_STATUS;
};

export { PROGRESS_STATUS, Progress };
