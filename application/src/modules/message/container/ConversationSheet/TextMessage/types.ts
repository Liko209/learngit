/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 09:53:25
 * Copyright © RingCentral. All rights reserved.
 */
// import { PromisedComputedValue } from 'computed-async-mobx';

type TextMessageProps = {
  id: number; // post id
  terms?: string[];
};

type TextMessageViewProps = {
  html: string;
  directCall: (phoneNumber: string) => void;
  canUseTelephony: () => Promise<boolean>;
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
  unicodeOnly?: boolean;
};

export {
  TextMessageProps,
  TextMessageViewProps,
  CustomEmojiMap,
  AtMentions,
  FormatToHtmlParams,
};
