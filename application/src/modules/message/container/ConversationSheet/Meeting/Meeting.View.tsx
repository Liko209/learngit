/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewProps, MEETING_STATUS } from './types';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiLink } from 'jui/components/Link';
import {
  JuiAudioConferenceDescription,
  JuiItemConjunctionText,
  JuiItemContent,
  JuiItemTextValue,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { phoneParserHoc } from '@/modules/common/container/PhoneParser/PhoneParserHoc';
import { MEETING_URL, SUCCESS_URL } from './constant';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';

type meetingProps = WithTranslation & ViewProps;
const PhoneNumberHoc = phoneParserHoc(JuiAudioConferenceDescription);

@observer
class Meeting extends React.Component<meetingProps> {
  private _renderMeetingContent = () => {
    const { t, meetingItem } = this.props;
    const { zoomMeetingId, joinUrl } = meetingItem;
    const dialNumber = meetingItem.getDialInNumber();
    return (
      <>
        <JuiItemContent title={t('item.meeting.meetingUrl')}>
          <JuiLink size="small" handleOnClick={() => window.open(joinUrl)}>
            {joinUrl}
          </JuiLink>
        </JuiItemContent>
        <JuiItemContent title={t('item.meeting.meetingId')}>
          <JuiItemTextValue description={String(zoomMeetingId)} />
        </JuiItemContent>
        <JuiItemContent title={t('item.dialInNumber')}>
          <PhoneNumberHoc description={formatPhoneNumber(dialNumber)} />
          {<JuiItemConjunctionText description={t('item.or')} />}
          <JuiLink
            size="small"
            handleOnClick={() => window.open(MEETING_URL)}
          >
            {t('item.globalNumber')}
          </JuiLink>
        </JuiItemContent>
        <JuiItemContent title={t('item.meeting.help')}>
          <JuiItemTextValue description={t('item.meeting.installProblems')} />
          <JuiItemConjunctionText description="" />
          <JuiLink
            size="small"
            handleOnClick={() => window.open(SUCCESS_URL)}
          >
            {t('item.meeting.readThis')}
          </JuiLink>
        </JuiItemContent>
      </>
    );
  }
  private _renderContent() {
    return null;
  }
  private _handleRenderSequence() {
    const { meetingItem } = this.props;
    const { status } = meetingItem;
    switch (status) {
      case MEETING_STATUS.LIVE:
        return this._renderMeetingContent();
      case MEETING_STATUS.ENDED:
        return this._renderContent();
      default:
        return this._renderContent();
    }
  }
  render() {
    const { t, meetingTitle, meetingItem, duration } = this.props;
    const { status } = meetingItem;
    const isEnded = status === MEETING_STATUS.ENDED;
    return (
      <JuiConversationItemCard
        title={t(meetingTitle)}
        Icon="meetings"
        subTitle={isEnded ? `${t('item.meeting.duration')}: ${duration}` : ''}
        isShowLoading={status === MEETING_STATUS.NOT_STARTED}
      >
        {this._handleRenderSequence()}
      </JuiConversationItemCard>
    );
  }
}
const MeetingView = withTranslation('translations')(Meeting);
export { MeetingView };
