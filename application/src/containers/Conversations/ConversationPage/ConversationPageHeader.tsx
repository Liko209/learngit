/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-03 18:29:20
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiConversationPageHeader } from 'ui-components/molecules/ConversationPageHeader';
import { JuiButtonBar } from 'ui-components/atoms/ButtonBar';
import { JuiCheckboxButton } from 'ui-components/molecules/CheckboxButton';
import { JuiIconButton } from 'ui-components/molecules/IconButton';
import { ConversationPageHeaderPresenter, ConversationTypes } from './ConversationPageHeaderPresenter';
import { getGroupName } from '@/utils/groupName';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import injectStore, { IComponentWithGetEntityProps } from '@/store/inject';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/models';

type ConversationPageHeaderProps = IComponentWithGetEntityProps & {
  id?: number;
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
    const { id, t = (str: string) => str, getEntity } = this.props;
    if (!id) {
      return null;
    }
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
    if (!group.members) {
      return null;
    }
    const groupName = getGroupName(getEntity, group, this.presenter.userId || undefined);
    const type = this.presenter.getConversationType(group);
    const isFavorite = this.presenter.groupIsInFavorites(group);
    const isPrivate = group.privacy === 'private';

    const MarkFavoriteButton = (
      <JuiCheckboxButton
        tooltipTitle={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
        checkedIconName="star"
        iconName="star_border"
        checked={isFavorite}
      >
        star_border
      </JuiCheckboxButton>
    );

    const LockButton = (
      <JuiCheckboxButton
        tooltipTitle={isPrivate ? t('thisIsAPrivateTeam') : t('thisIsAPublicTeam')}
        checkedIconName="lock"
        iconName="lock_open"
        checked={isPrivate}
      >
        favorite_border
      </JuiCheckboxButton>
    );

    const CallButton = <JuiIconButton tooltipTitle={t('startVoiceCall')}>local_phone</JuiIconButton>;
    const AudioConferenceButton = <JuiIconButton tooltipTitle={t('startConferenceCall')}>device_hub</JuiIconButton>;
    const MeetingButton = <JuiIconButton tooltipTitle={t('startVideoCall')}>videocam</JuiIconButton>;
    const AddMemberButton = <JuiIconButton tooltipTitle={t('addMembers')}>person_add</JuiIconButton>;
    const MoreButton = <JuiIconButton tooltipTitle={t('conversationSettings')}>settings</JuiIconButton>;

    enum Buttons {
      MarkFavorite,
      Lock,
      Call,
      AudioConference,
      Meeting,
      AddMember,
      More,
    }

    const typeIconMap = {
      [ConversationTypes.TEAM]: [Buttons.MarkFavorite, Buttons.Lock, Buttons.AudioConference, Buttons.Meeting, Buttons.AddMember, Buttons.More],
      [ConversationTypes.ME]: [Buttons.MarkFavorite, Buttons.More],
      [ConversationTypes.SMS]: [Buttons.MarkFavorite, Buttons.Call, Buttons.Meeting, Buttons.AddMember, Buttons.More],
      [ConversationTypes.NORMAL_ONE_TO_ONE]: [Buttons.MarkFavorite, Buttons.Call, Buttons.Meeting, Buttons.AddMember, Buttons.More],
      [ConversationTypes.NORMAL_GROUP]: [Buttons.MarkFavorite, Buttons.AudioConference, Buttons.Meeting, Buttons.AddMember, Buttons.More],
    };
    return (
      <JuiConversationPageHeader
        title={groupName + (type === ConversationTypes.SMS ? ` (${t('text')})` : '')}
        SubTitle={
          <JuiButtonBar size="small" overlapping={true}>
            {typeIconMap[type].includes(Buttons.MarkFavorite) ? MarkFavoriteButton : null}
            {typeIconMap[type].includes(Buttons.Lock) ? LockButton : null}
          </JuiButtonBar>}
        Right={
          <JuiButtonBar size="medium" overlapping={true}>
            {typeIconMap[type].includes(Buttons.Call) ? CallButton : null}
            {typeIconMap[type].includes(Buttons.AudioConference) ? AudioConferenceButton : null}
            {typeIconMap[type].includes(Buttons.Meeting) ? MeetingButton : null}
            {typeIconMap[type].includes(Buttons.AddMember) ? AddMemberButton : null}
            {typeIconMap[type].includes(Buttons.More) ? MoreButton : null}
          </JuiButtonBar>}
      />
    );
  }
}

const ConversationPageHeader = translate('ConversationPageHeader')(injectStore()(ConversationPageHeaderComponent));
export { ConversationPageHeader, ConversationPageHeaderProps };
