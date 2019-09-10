/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-15 10:13:01
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  save: () => void;
  isLoading: boolean;
  inputValue: string;
  showCloseBtn: boolean;
  handleInputValueChange: (value: string) => void;
  handleEmojiChange: (native: string) => void;
  clearStatus: () => void;
  emoji: string;
};

export { Props, ViewProps };
