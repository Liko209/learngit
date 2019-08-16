/*
 * @Author: isaac.liu
 * @Date: 2019-06-27 08:14:21
 * Copyright © RingCentral. All rights reserved.
 */
import { createDecorator } from 'framework/ioc';
import { IDummyService } from '../utils';

const ILeaveBlockerService = createDecorator('LEAVE_BLOCKER_SERVICE');

type ILeaveBlockerService = IDummyService;

export { ILeaveBlockerService };
