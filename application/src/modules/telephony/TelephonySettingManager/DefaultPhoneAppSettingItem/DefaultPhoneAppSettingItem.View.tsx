/*
 * @Author: Andy Hu(Andy.Hu@ringcentral.com)
 * @Date: 2019-05-06 14:40:39
 * Copyright Â© RingCentral. All rights reserved.
 */
import { CALLING_OPTIONS } from 'sdk/module/profile/constants';
import { withTranslation, WithTranslation } from 'react-i18next';
import React, { SFC } from 'react';
import JuiText from 'jui/components/Text/Text';

type DefaultPhoneAppSelectItemProps = {
  value: CALLING_OPTIONS;
};

const options = {
  [CALLING_OPTIONS.GLIP]: 'setting.phone.general.defaultPhoneApp.option.glip',
  [CALLING_OPTIONS.RINGCENTRAL]:
    'setting.phone.general.defaultPhoneApp.option.ringcentral',
};

const DefaultPhoneAppSelectItemCom: SFC<
  DefaultPhoneAppSelectItemProps & WithTranslation
> = ({ value, t }) => {
  return <>{options[value]}</>;
};

const DefaultPhoneAppSelectValueCom = ({
  value,
  t,
}: DefaultPhoneAppSelectItemProps & WithTranslation) => {
  return <JuiText>{t(options[value])}</JuiText>;
};

const DefaultPhoneAppSelectValue = withTranslation('translations')(
  DefaultPhoneAppSelectValueCom,
);

const DefaultPhoneAppSelectItem = withTranslation('translations')(
  DefaultPhoneAppSelectItemCom,
);

export {
  DefaultPhoneAppSelectItem,
  DefaultPhoneAppSelectValue,
  DefaultPhoneAppSelectItemProps,
};
