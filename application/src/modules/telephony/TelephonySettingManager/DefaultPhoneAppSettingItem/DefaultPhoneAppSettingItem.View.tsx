/*
 * @Author: Andy Hu(Andy.Hu@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright Â© RingCentral. All rights reserved.
 */
import { CALLING_OPTIONS } from 'sdk/module/profile/constants';
import { i18nP } from '@/utils/i18nT';

type DefaultPhoneAppSelectItemProps = {
  value: CALLING_OPTIONS;
};

const options = {
  [CALLING_OPTIONS.GLIP]: 'setting.phone.general.defaultPhoneApp.option.glip',
  [CALLING_OPTIONS.RINGCENTRAL]:
    'setting.phone.general.defaultPhoneApp.option.ringcentral',
};

const DefaultPhoneAppSelectItem = ({
  value,
}: DefaultPhoneAppSelectItemProps) => i18nP(options[value]);

export { DefaultPhoneAppSelectItem, DefaultPhoneAppSelectItemProps };
