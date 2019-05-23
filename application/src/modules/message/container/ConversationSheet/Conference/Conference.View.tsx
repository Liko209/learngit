/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:34:00
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiItemContent,
  JuiItemTextValue,
  JuiItemConjunctionText,
  JuiAudioConferenceDescription,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';

import { JuiLink } from 'jui/components/Link';
import { phoneParserHoc } from '@/modules/common/container/PhoneParser/PhoneParserHoc';

import { ViewProps } from './types';

type conferenceViewProps = WithTranslation & ViewProps;
const PhoneNumberHoc = phoneParserHoc(JuiAudioConferenceDescription);

@observer
class Conference extends React.Component<conferenceViewProps> {
  render() {
    const { conference, isHostByMe, globalNumber, t } = this.props;
    const { phoneNumber, hostCode, participantCode } = conference;

    return (
      <JuiConversationItemCard
        title={t('item.audioConferenceTitle')}
        Icon="conference"
        data-test-automation-id="conferenceItem"
      >
        <JuiItemContent title={t('item.dialInNumber')}>
          <PhoneNumberHoc
            data-test-automation-id="conferencePhoneNumber"
            description={phoneNumber}
          />
          {phoneNumber ? (
            <JuiItemConjunctionText description={t('item.or')} />
          ) : null}
          <JuiLink
            size="small"
            data-test-automation-id="conferenceGlobalNumber"
            handleOnClick={() => window.open(globalNumber)}
          >
            {t('item.globalNumber')}
          </JuiLink>
        </JuiItemContent>
        {isHostByMe ? (
          <JuiItemContent title={t('item.hostCode')}>
            <JuiItemTextValue
              description={hostCode}
              data-test-automation-id="conferenceHostCode"
            />
          </JuiItemContent>
        ) : null}
        <JuiItemContent title={t('item.participantCode')}>
          <JuiItemTextValue
            description={participantCode}
            data-test-automation-id="conferenceParticipantCode"
          />
        </JuiItemContent>
      </JuiConversationItemCard>
    );
  }
}

const ConferenceView = withTranslation('translations')(Conference);

export { ConferenceView };
