/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:34:00
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import {
  JuiItemContent,
  JuiItemTextValue,
  JuiItemConjunctionText,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { JuiLink } from 'jui/components/Link';

import { ViewProps } from './types';

type conferenceViewProps = WithNamespaces & ViewProps;

@observer
class Conference extends React.Component<conferenceViewProps> {
  render() {
    const { conference, isHostByMe, globalNumber, t } = this.props;
    const { phoneNumber, hostCode, participantCode } = conference;

    return (
      <JuiConversationItemCard
        title={t('audioConference')}
        Icon="conference"
        data-test-automation-id="audioConferenceCard"
      >
        <JuiItemContent title={t('dialInNumber')}>
          <JuiLink size="small">{phoneNumber}</JuiLink>
          {phoneNumber ? (
            <JuiItemConjunctionText description={t('or')} />
          ) : null}
          <JuiLink size="small" handleOnClick={() => window.open(globalNumber)}>
            {t('globalNumber')}
          </JuiLink>
        </JuiItemContent>
        {isHostByMe ? (
          <JuiItemContent title={t('hostCode')}>
            <JuiItemTextValue description={hostCode} />
          </JuiItemContent>
        ) : null}
        <JuiItemContent title={t('participantCode')}>
          <JuiItemTextValue description={participantCode} />
        </JuiItemContent>
      </JuiConversationItemCard>
    );
  }
}

const ConferenceView = translate('translations')(Conference);

export { ConferenceView };
