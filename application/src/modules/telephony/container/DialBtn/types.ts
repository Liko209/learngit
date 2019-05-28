/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-29 16:16:10
 * Copyright © RingCentral. All rights reserved.
 */

type DialBtnProps = {};

type DialBtnViewProps = {
  makeCall: () => void;
  trackCall: (analysisSource?: string) => void;
};

export { DialBtnProps, DialBtnViewProps };
