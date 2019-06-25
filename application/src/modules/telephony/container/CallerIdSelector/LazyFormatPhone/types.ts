/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:14:58
 * Copyright © RingCentral. All rights reserved.
 */

export type LazyFormatPhoneProps = {
  value: string;
};

export type LazyFormatViewPhoneProps = {
  onAfterRender: () => void;
  formattedPhoneNumber: string;
};
