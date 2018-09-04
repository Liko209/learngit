/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-03 18:29:20
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
// import { JuiConversationPageHeader, JuiButtonBar, JuiCheckboxButton, JuiIconButton } from 'ui-components';
import { JuiConversationPageHeader } from 'ui-components/molecules/ConversationPageHeader';
import { JuiButtonBar } from 'ui-components/atoms/ButtonBar';
import { JuiCheckboxButton } from 'ui-components/molecules/CheckboxButton';
import { JuiIconButton } from 'ui-components/molecules/IconButton';
import { ConversationPageHeaderPresenter, ConversationTypes } from './ConversationPageHeaderPresenter';
import { getGroupName } from '../../../utils/groupName';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';

type ConversationPageHeaderProps = {
  id: number;
  t: TranslationFunction;
};
@observer
class ConversationPageHeaderComponent extends React.Component<ConversationPageHeaderProps, {}> {
  presenter: ConversationPageHeaderPresenter;

  constructor(props: ConversationPageHeaderProps) {
    super(props);
    this.presenter = new ConversationPageHeaderPresenter();
  }
  render() {
    const { id, t = (str: string) => str } = this.props;
    if (!id) {
      return null;
    }
    const group = this.presenter.groupStore.get(id);
    if (!group.members) {
      return null;
    }
    const groupName = getGroupName(group, this.presenter.userId || undefined);
    const type = this.presenter.getConversationType(group);
    const otherMember = this.presenter.getOtherMember(group);
    const isFavorite = this.presenter.groupIsInFavorites(group);
    const isPrivate = group.privacy === 'private';

    const MarkFavoriteButton = (
      <JuiCheckboxButton
        tooltipTitle={isFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
        checkedIconName="star"
        iconName="star_border"
        checked={isFavorite}
      >
        star_border
      </JuiCheckboxButton>
    );

    const LockButton = (
      <JuiCheckboxButton
        tooltipTitle={isPrivate ? t('this_is_a_private_team') : t('this_is_a_public_team')}
        checkedIconName="lock"
        iconName="lock_open"
        checked={isPrivate}
      >
        favorite_border
      </JuiCheckboxButton>
    );

    const CallButton = <JuiIconButton tooltipTitle={t('start_voice_call_with', { whom: otherMember ? otherMember.displayName : '' })}>local_phone</JuiIconButton>;
    const AudioConferenceButton = <JuiIconButton tooltipTitle={t('start_conference_call_in', { groupName })}>device_hub</JuiIconButton>;
    const MeetingButton = <JuiIconButton tooltipTitle={t('start_video_call')}>videocam</JuiIconButton>;
    const AddMemberButton = <JuiIconButton tooltipTitle={t('add_members')}>person_add</JuiIconButton>;
    const MoreButton = <JuiIconButton tooltipTitle={t('conversation_settings')}>settings</JuiIconButton>;

    const buttons = {
      1: MarkFavoriteButton,
      2: LockButton,
      3: CallButton,
      4: AudioConferenceButton,
      5: MeetingButton,
      6: AddMemberButton,
      7: MoreButton,
    };
    const typeIconMap = {
      [ConversationTypes.TEAM]: [1, 2, 4, 5, 6, 7],
      [ConversationTypes.ME]: [1, 7],
      [ConversationTypes.SMS]: [1, 3, 5, 6, 7],
      [ConversationTypes.NORMAL_ONE_TO_ONE]: [1, 3, 5, 6, 7],
      [ConversationTypes.NORMAL_GROUP]: [1, 4, 5, 6, 7],
    };
    console.log(type);
    return (
      <JuiConversationPageHeader
        title={groupName + (type === ConversationTypes.SMS ? ' (text)' : '')}
        SubTitle={
          <JuiButtonBar size="small" overlapping={true}>
            {typeIconMap[type].includes(1) ? buttons[1] : null}
            {typeIconMap[type].includes(2) ? buttons[2] : null}
          </JuiButtonBar>}
        Right={
          <JuiButtonBar size="medium" overlapping={true}>
            {typeIconMap[type].includes(3) ? buttons[3] : null}
            {typeIconMap[type].includes(4) ? buttons[4] : null}
            {typeIconMap[type].includes(5) ? buttons[5] : null}
            {typeIconMap[type].includes(6) ? buttons[6] : null}
            {typeIconMap[type].includes(7) ? buttons[7] : null}
          </JuiButtonBar>}
      />
    );
  }
}

const ConversationPageHeader = translate('ConversationPageHeader')(ConversationPageHeaderComponent);
export { ConversationPageHeader, ConversationPageHeaderProps };
