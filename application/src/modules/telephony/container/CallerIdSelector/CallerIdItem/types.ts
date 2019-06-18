/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 13:14:58
 * Copyright © RingCentral. All rights reserved.
 */

export type CallerIdItemProps = {
  phoneNumber: string;
  value: string;
  usageType: string;
  label?: string;
  onClick?: () => void;
  selected?: boolean;
};

export type CallerIdItemViewProps = CallerIdItemProps & {
  formattedPhoneNumber: string;
  isTwoLine: boolean;
};
