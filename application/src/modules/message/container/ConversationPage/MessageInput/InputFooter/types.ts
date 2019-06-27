/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 13:24:07
 * Copyright © RingCentral. All rights reserved.
 */
import { WithTranslation } from 'react-i18next';

type InputFooterProps = {
  hasInput: boolean;
};

type InputFooterViewProps = WithTranslation & {
  typingList: string[];
  showTypingIndicator: boolean;
  showMarkupTips: boolean;
};

export { InputFooterProps, InputFooterViewProps };
