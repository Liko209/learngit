/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type ActionsProps = {
  id: number; // post id
  onFocus: (value: boolean) => void;
  onBlur: (value: boolean) => void;
};

type ActionsViewProps = {
  id: number;
  onFocus: (value: boolean) => void;
  onBlur: (value: boolean) => void;
};

export { ActionsProps, ActionsViewProps };
