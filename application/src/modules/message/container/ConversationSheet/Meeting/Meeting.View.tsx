/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewProps } from './types';
import { MEETING_STATUS } from '@/store/models/MeetingsUtils';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiLink } from 'jui/components/Link';
import {
  JuiAudioConferenceDescription,
  JuiItemConjunctionText,
  JuiItemContent,
  JuiItemTextValue,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { MEETING_URL } from './constant';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import {
  postParser,
  HighlightContextInfo,
  SearchHighlightContext,
} from '@/common/postParser';
import { MeetingStatus } from './MeetingStatus.View';
import moize from 'moize';

type meetingProps = WithTranslation & ViewProps;

@observer
class Meeting extends React.Component<meetingProps> {
  static contextType = SearchHighlightContext;
  context: HighlightContextInfo;
  private _renderMeetingContent = () => {
    const { t, meetingItem, meetingId, getDialInNumber } = this.props;
    const { joinUrl } = meetingItem;
    const dialNumber = getDialInNumber();
    return (
      <>
        <JuiItemContent title={t('item.meeting.meetingUrl')}>
          <JuiLink size="small" handleOnClick={() => window.open(joinUrl)}>
            {postParser(joinUrl, {
              keyword: this.context.keyword,
            })}
          </JuiLink>
        </JuiItemContent>
        <JuiItemContent title={t('item.meeting.meetingId')}>
          <JuiItemTextValue
            description={postParser(String(meetingId), {
              keyword: this.context.keyword,
            })}
          />
        </JuiItemContent>
        <JuiItemContent title={t('item.dialInNumber')}>
          <JuiAudioConferenceDescription>
            {postParser(formatPhoneNumber(dialNumber), {
              keyword: this.context.keyword,
              phoneNumber: true,
            })}
          </JuiAudioConferenceDescription>
          {<JuiItemConjunctionText description={t('item.or')} />}
          <JuiLink size="small" handleOnClick={() => window.open(MEETING_URL)}>
            {t('item.globalNumber')}
          </JuiLink>
        </JuiItemContent>
      </>
    );
  };
  private _renderContent() {
    return null;
  }

  private _handleRenderSequence() {
    const { meetingItem } = this.props;
    const status = meetingItem.meetingStatus;
    switch (status) {
      case MEETING_STATUS.LIVE:
        return this._renderMeetingContent();
      case MEETING_STATUS.ENDED:
        return this._renderContent();
      default:
        return this._renderContent();
    }
  }

  private _getStatusClick = moize((status: MEETING_STATUS) => {
    const statusClickStrategy = {
      [MEETING_STATUS.NO_ANSWER]: this.props.callbackMeeting,
      [MEETING_STATUS.NOT_STARTED]: this.props.cancelMeeting,
      [MEETING_STATUS.LIVE]: this.props.joinMeeting,
    };
    return statusClickStrategy[status];
  });

  render() {
    const { t, meetingTitle, meetingItem, duration, isMeetingOwner } = this.props;
    const status = meetingItem.meetingStatus;
    return (
      <JuiConversationItemCard
        title={postParser(t(meetingTitle), { keyword: this.context.keyword })}
        Icon="meetings"
        subTitle={
          <MeetingStatus
            status={status}
            duration={`${t('item.meeting.duration')}: ${duration}`}
            onStatusClick={this._getStatusClick(status)}
            isOwner={isMeetingOwner}
          />
        }
        isShowLoading={status === MEETING_STATUS.NOT_STARTED
        }
      >
        {this._handleRenderSequence()}
      </JuiConversationItemCard>
    );
  }
}
const MeetingView = withTranslation('translations')(Meeting);
export { MeetingView };
