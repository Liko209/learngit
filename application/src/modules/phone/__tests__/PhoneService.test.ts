/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:21:53
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { registerModule } from 'shield/utils';
import * as phone from '@/modules/phone/module.config';
import { IPhoneService } from '../interface/IPhoneService';
import { PHONE_SERVICE } from '../interface/constant';

jest.mock('@/store/utils');

registerModule(phone.config);

describe('PhoneService', () => {
  it('should get PhoneService', async () => {
    const phoneService: IPhoneService = container.get(PHONE_SERVICE);
    expect(phoneService).toBeTruthy();
  });
});
