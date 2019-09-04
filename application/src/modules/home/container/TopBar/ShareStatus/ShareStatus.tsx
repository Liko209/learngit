/*
 * @Author: Alvin.Huang
 * @Date: 2019-08-30 10:29:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withRCMode } from '@/containers/withRCMode';
import { JuiStyledDropdownMenuItem } from 'jui/pattern/TopBar';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Emoji, getEmojiDataFromNative } from 'emoji-mart';
import data from 'emoji-mart/data/all.json';
import { backgroundImageFn } from 'jui/pattern/Emoji';

type Props = {
  awayStatus: string;
  colons: string;
  handleCustomStatus: () => void;
  handleClearStatus: () => void;
} & WithTranslation;
const set = 'emojione';

@observer
@withRCMode()
class ShareStatusComponent extends React.Component<Props> {
  render() {
    const {
      awayStatus,
      colons,
      handleClearStatus,
      handleCustomStatus,
      t,
    } = this.props;
    const emojiData = getEmojiDataFromNative(colons, set, data);

    return (
      <>
        {awayStatus || colons ? (
          <JuiStyledDropdownMenuItem
            onClick={handleClearStatus}
            aria-label={t('home.clearStatus')}
            data-test-automation-id="clearStatus"
          >
            {t('home.clearStatus')}
          </JuiStyledDropdownMenuItem>
        ) : (
          <JuiStyledDropdownMenuItem
            onClick={handleCustomStatus}
            aria-label={t('home.shareStatus')}
            data-test-automation-id="shareStatus"
          >
            {t('home.shareStatus')}
          </JuiStyledDropdownMenuItem>
        )}
        {awayStatus || colons ? (
          <JuiStyledDropdownMenuItem
            onClick={handleCustomStatus}
            aria-label={t('home.shareStatus')}
            data-test-automation-id="sharedStatus"
          >
            {colons ? (
              <Emoji
                emoji={(emojiData && emojiData.colons) || ''}
                set={set}
                size={16}
                backgroundImageFn={backgroundImageFn}
              />
            ) : null}
            {awayStatus}
          </JuiStyledDropdownMenuItem>
        ) : null}
      </>
    );
  }
}
const ShareStatusItem = withTranslation('translations')(ShareStatusComponent);
export { ShareStatusItem };
