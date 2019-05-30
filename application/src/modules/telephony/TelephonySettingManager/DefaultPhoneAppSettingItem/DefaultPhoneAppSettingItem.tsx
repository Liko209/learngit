/*
 * @Author: Andy Hu(Andy.Hu@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright Â© RingCentral. All rights reserved.
 */
import { CALLING_OPTIONS } from 'sdk/module/profile/constants';
import { withTranslation, WithTranslation } from 'react-i18next';
import React, { SFC } from 'react';
type DefaultPhoneAppSelectItemProps = {
  value: CALLING_OPTIONS;
};

const DefaultPhoneAppSelectItem: SFC<
  DefaultPhoneAppSelectItemProps & WithTranslation
> = ({ value, t }) => {
  const options = {
    [CALLING_OPTIONS.GLIP]: t(
      'setting.phone.general.defaultPhoneApp.option.glip',
    ),
    [CALLING_OPTIONS.RINGCENTRAL]: t(
      'setting.phone.general.defaultPhoneApp.option.ringcentral',
    ),
  };
  return <> {options[value]}</>;
};

const withTranslationComp = withTranslation()(DefaultPhoneAppSelectItem);

export {
  withTranslationComp as DefaultPhoneAppSelectItem,
  DefaultPhoneAppSelectItemProps,
};
