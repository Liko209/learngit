/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-07 15:15:22
 * Copyright © RingCentral. All rights reserved.
 */

type EditMessageInputProps = {
  id: number; // post id
  viewRef?: React.RefObject<any>;
};

type EditMessageInputViewProps = {
  gid: number;
  error: string;
  text: string;
  id: number;
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  };
};

export { EditMessageInputProps, EditMessageInputViewProps };
