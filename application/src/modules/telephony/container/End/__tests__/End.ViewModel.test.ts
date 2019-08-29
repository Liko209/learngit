/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyService } from '../../../service/TelephonyService';
import { EndViewModel } from '../End.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import * as telephony from '@/modules/telephony/module.config';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');
jest.mock('../../../service/TelephonyService');
jest.mock('@/modules/telephony/HOC/withDialogOrNewWindow');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let endViewModel: EndViewModel;

describe('EndViewModel', () => {
  it('should not call hangUp function', () => {
    (getEntity as jest.Mock).mockReturnValue({
      connectingTime: Date.now(),
    });
    endViewModel = new EndViewModel({});
    endViewModel.end();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.hangUp).not.toHaveBeenCalled();
  });

  it('should call hangUp function', async () => {
    (getEntity as jest.Mock).mockReturnValue({ connectingTime: Date.now() });

    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
    endViewModel.end();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.hangUp).toHaveBeenCalled();
  });
});
