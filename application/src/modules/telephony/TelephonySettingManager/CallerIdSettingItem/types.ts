/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { IPhoneNumberRecord } from 'sdk/api/ringcentral/types/common';

type CallerIdSelectItemProps = {
  value: IPhoneNumberRecord;
};

type CallerIdSettingItemViewProps = {
  parsedSourceItem?: IPhoneNumberRecord;
};

export { CallerIdSelectItemProps, CallerIdSettingItemViewProps };
