/*
 * @Author: Paynter Chen
 * @Date: 2019-04-14 07:45:45
 * Copyright © RingCentral. All rights reserved.
 */
type onAccessibleChange = (accessible: boolean) => void;

interface IAccessor {
  isAccessible(): boolean;
  subscribe(onChange: onAccessibleChange): void;
}

export { onAccessibleChange, IAccessor };
