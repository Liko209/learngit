/*
 * @Author: Alvin Huang
 * @Date: 2019-08-22 14:05:24
 * Copyright © RingCentral. All rights reserved.
 */
import { getEmojiDataFromNative } from 'emoji-mart';
import { EMOJI_UNICODE_REGEX } from './postParser/utils';
import data from 'emoji-mart/data/all.json';

const GLOBAL_MATCH_EMOJI = new RegExp(EMOJI_UNICODE_REGEX, 'g');

const getColonsEmoji = (awayStatus: string) => {
  const matchedEmoji = awayStatus.match(EMOJI_UNICODE_REGEX);
  if (matchedEmoji) {
    const emojiData = getEmojiDataFromNative(matchedEmoji[0], 'emojione', data);
    return emojiData && emojiData.colons;
  }
  return '';
};
const getStatusPlainText = (awayStatus: string) => {
  const statusWithoutEmoji = awayStatus.replace(GLOBAL_MATCH_EMOJI, () => {
    return '';
  });
  const matchedEmoji = awayStatus.match(EMOJI_UNICODE_REGEX);
  if (matchedEmoji) {
    return `  ${statusWithoutEmoji}`;
  }
  return statusWithoutEmoji;
};

export { getColonsEmoji, getStatusPlainText };
