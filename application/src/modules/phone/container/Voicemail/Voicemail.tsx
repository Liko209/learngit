/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:39:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { PhoneWrapper } from 'jui/pattern/Phone/PhoneWrapper';
import { PhoneHeader } from 'jui/pattern/Phone/PhoneHeader';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';

@observer
class VoicemailComp extends Component<WithTranslation> {
  render() {
    const { t } = this.props;
    return (
      <>
        <PhoneHeader
          title={t('phone.voicemail')}
          data-test-automation-id="VoicemailPageHeader"
        />
        <PhoneWrapper>Voicemail</PhoneWrapper>
      </>
    );
  }
}

const Voicemail = withTranslation('translations')(VoicemailComp);

export { Voicemail };
