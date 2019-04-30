/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 09:53:25
 * Copyright © RingCentral. All rights reserved.
 */

type TextMessageProps = {
  id: number; // post id
  terms?: string[];
};

type TextMessageViewProps = {
  html: string;
};

type CustomEmojiMap = {
  [index: string]: { data: string };
};

type AtMentions = {
  [index: number]: string;
};

type FormatToHtmlParams = {
  text: string;
  atMentions: AtMentions;
  currentUserId: number;
  staticHttpServer: string;
  customEmojiMap: CustomEmojiMap;
  highlightTerms?: string[];
};

export {
  TextMessageProps,
  TextMessageViewProps,
  CustomEmojiMap,
  AtMentions,
  FormatToHtmlParams,
};
