/*
 * @Author: ken.li
 * @Date: 2019-04-29 17:12:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { EmojiViewProps, EmojiProps } from './types';
import { JuiEmojiWithTheme } from 'jui/pattern/Emoji';
import { i18nP } from '@/utils/i18nT';

type Types = EmojiViewProps & EmojiProps;
@observer
class EmojiView extends Component<Types> {
  handleKeepOpenChange = () => {
    this.props.setEmojiOpenStatus();
  };
  private _getEmojiI18nTexts = () => ({
    search: i18nP('message.emoji.i18n.search'),
    clear: i18nP('message.emoji.i18n.clear'), // Accessible label on "clear" button
    notfound: i18nP('message.emoji.i18n.notfound'),
    skintext: i18nP('message.emoji.i18n.skintext'),
    categories: {
      search: i18nP('message.emoji.i18n.categories.search'),
      recent: i18nP('message.emoji.i18n.categories.recent'),
      people: i18nP('message.emoji.i18n.categories.people'),
      nature: i18nP('message.emoji.i18n.categories.nature'),
      foods: i18nP('message.emoji.i18n.categories.foods'),
      activity: i18nP('message.emoji.i18n.categories.activity'),
      places: i18nP('message.emoji.i18n.categories.places'),
      objects: i18nP('message.emoji.i18n.categories.objects'),
      symbols: i18nP('message.emoji.i18n.categories.symbols'),
      flags: i18nP('message.emoji.i18n.categories.flags'),
      custom: i18nP('message.emoji.i18n.categories.custom'),
    },
    categorieslabel: i18nP('message.emoji.i18n.categorieslabel'), // Accessible title for the list of categories
    skintones: {
      1: i18nP('message.emoji.i18n.skintones.default'),
      2: i18nP('message.emoji.i18n.skintones.light'),
      3: i18nP('message.emoji.i18n.skintones.mediumLight'),
      4: i18nP('message.emoji.i18n.skintones.medium'),
      5: i18nP('message.emoji.i18n.skintones.mediumDark'),
      6: i18nP('message.emoji.i18n.skintones.dark'),
    },
  });
  render() {
    const {
      handleEmojiClick,
      set,
      sheetSize,
      title,
      emojiOpenStatus,
      tooltip,
      icon = 'emoji',
    } = this.props;
    return (
      <JuiEmojiWithTheme
        tooltip={tooltip}
        i18nObj={this._getEmojiI18nTexts()}
        set={set}
        sheetSize={sheetSize}
        title={title}
        handlerIcon={icon}
        handleEmojiClick={handleEmojiClick}
        handleKeepOpenChange={this.handleKeepOpenChange}
        isKeepOpen={emojiOpenStatus}
        toggleButtonLabel={i18nP('message.emoji.toggleButtonLabel') as string}
      />
    );
  }
}

export { EmojiView };
