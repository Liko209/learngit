/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-04-30 09:07:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { container } from 'framework';
import { TelephonyService } from '@/modules/telephony/service';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { JuiConversationNumberLink } from 'jui/pattern/ConversationCard';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { isSupportWebRTC, isValidPhoneNumber, handleHrefAttribute } from './helper';

@observer
class CommonPhoneLink extends React.Component<{
  description: string;
}> {
  @observable
  canUseTelephony = false;
  private _featuresFlagsService: FeaturesFlagsService = container.get(
    FeaturesFlagsService,
  );
  private _isRCUser = getGlobalValue(GLOBAL_KEYS.IS_RC_USER);
  async componentDidMount() {
    this.canUseTelephony = await this._featuresFlagsService.canUseTelephony();
  }
  private _detachNumberNString = (description: string) => {
    const FILTER_NUMBER_STRING_REGEX = /\+?(\d{1,4} ?)?((\(\d{1,4}\)|\d(( |\-)?\d){0,3})(( |\-)?\d){2,}|(\(\d{2,4}\)|\d(( |\-)?\d){1,3})(( |\-)?\d){1,})(( x| ext.?)\d{1,5}){0,1}|[\D]/g;
    return description.match(FILTER_NUMBER_STRING_REGEX) || [];
  }
  private _handlePhoneClick = (
    evt: React.MouseEvent<HTMLAnchorElement>,
    phoneNumber: string,
  ) => {
    if (this._isRCUser && this.canUseTelephony && isSupportWebRTC()) {
      evt.preventDefault();
      const telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      telephonyService.directCall(phoneNumber);
    }
  }
  private _renderPhoneLink = (content: string, key: number) => {
    return (
      <JuiConversationNumberLink
        href={handleHrefAttribute({
          content,
          canUseTelephony: this.canUseTelephony,
        })}
        key={key}
        data-test-automation-id="phoneNumberLink"
        onClick={
          this._isRCUser
            ? (evt: React.MouseEvent<HTMLAnchorElement>) =>
              this._handlePhoneClick(evt, content)
            : () => null
        }
        data-id={content}
      >
        {content}
      </JuiConversationNumberLink>
    );
  }
  render() {
    const { description } = this.props;
    const detachedString = this._detachNumberNString(description);
    return detachedString.map((content: string, key: number) => {
      if (isValidPhoneNumber(content) && this._isRCUser) {
        return this._renderPhoneLink(content, key);
      }
      return content;
    });
  }
}
export { CommonPhoneLink };
