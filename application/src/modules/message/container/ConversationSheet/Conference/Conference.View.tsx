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
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

import { JuiLink } from 'jui/components/Link';

import { ViewProps } from './types';
import {
  postParser,
  HighlightContextInfo,
  SearchHighlightContext,
} from '@/common/postParser';

type conferenceViewProps = WithTranslation & ViewProps;

@observer
class Conference extends React.Component<conferenceViewProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
  render() {
    const { conference, isHostByMe, globalNumber, phoneNumber, t } = this.props;
    const { hostCode, participantCode } = conference;

    return (
      <JuiConversationItemCard
        title={postParser(t('item.audioConferenceTitle'), {
          keyword: this.context.keyword,
        })}
        Icon="conference"
        data-test-automation-id="conferenceItem"
      >
        <JuiItemContent title={t('item.dialInNumber')}>
          <JuiAudioConferenceDescription data-test-automation-id="conferencePhoneNumber">
            {postParser(formatPhoneNumber(phoneNumber), {
              keyword: this.context.keyword,
              phoneNumber: true,
            })}
          </JuiAudioConferenceDescription>
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
