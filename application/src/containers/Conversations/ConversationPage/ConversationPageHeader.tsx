/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-03 18:29:20
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiConversationPageHeader } from 'ui-components/molecules/ConversationPageHeader';
import { JuiButtonBar } from 'ui-components/molecules/ButtonBar';
import { JuiCheckboxButton } from 'ui-components/molecules/CheckboxButton';
import { JuiIconButton } from 'ui-components/molecules/IconButton';
import {
  ConversationPageHeaderPresenter,
  ConversationTypes,
} from './ConversationPageHeaderPresenter';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import injectStore, { IInjectedStoreProps } from '@/store/inject';
import VM from '@/store/ViewModel';
import { toTitleCase } from '@/utils';

type ConversationPageHeaderProps = IInjectedStoreProps<VM> & {
  id: number;
  t: TranslationFunction;
};
@observer
class ConversationPageHeaderComponent extends React.Component<
  ConversationPageHeaderProps,
  {}
> {
  constructor(props: ConversationPageHeaderProps) {
    super(props);
    this.rightButtonClickHandler = this.rightButtonClickHandler.bind(this);
  }
  rightButtonClickHandler(evt: React.SyntheticEvent, name: string) {
    // console.log(evt, name);
  }

  render() {
    const { t = (str: string) => str, id } = this.props;
    const presenter = new ConversationPageHeaderPresenter(id);
    const groupName = presenter.getGroupName(t);
    const type = presenter.getConversationType();
    const isFavorite = presenter.groupIsInFavorites();
    const isPrivate = presenter.groupIsPrivate();

    const rightButtons = presenter
      .getRightButtons()
      .map(({ name, iconName, tooltip }) =>
        ((name: string) => {
          const onRightButtonClick = (e: React.SyntheticEvent) =>
            this.rightButtonClickHandler(e, name);
          return (
            <JuiIconButton
              key={name}
              tooltipTitle={toTitleCase(t(tooltip))}
              onClick={onRightButtonClick}
            >
              {iconName}
            </JuiIconButton>
          );
        })(name),
      );
    return (
      <JuiConversationPageHeader
        title={groupName}
        SubTitle={
          <JuiButtonBar size="small" overlapping={true}>
            <JuiCheckboxButton
              tooltipTitle={
                isFavorite
                  ? toTitleCase(t('removeFromFavorites'))
                  : toTitleCase(t('addToFavorites'))
              }
              checkedIconName="star"
              iconName="star_border"
              checked={isFavorite}
            >
              star_border
            </JuiCheckboxButton>
            {type === ConversationTypes.TEAM ? (
              <JuiCheckboxButton
                tooltipTitle={
                  isPrivate ? t('thisIsAPrivateTeam') : t('thisIsAPublicTeam')
                }
                checkedIconName="lock"
                iconName="lock_open"
                checked={isPrivate}
              >
                favorite_border
              </JuiCheckboxButton>
            ) : null}
          </JuiButtonBar>}
        Right={
          <JuiButtonBar size="medium" overlapping={true}>
            {rightButtons}
            <JuiIconButton
              tooltipTitle={toTitleCase(t('conversationSettings'))}
            >
              settings
            </JuiIconButton>
          </JuiButtonBar>}
      />
    );
  }
}

const ConversationPageHeader = translate('ConversationPageHeader')(
  injectStore(VM)(ConversationPageHeaderComponent),
);
export { ConversationPageHeader, ConversationPageHeaderProps };
