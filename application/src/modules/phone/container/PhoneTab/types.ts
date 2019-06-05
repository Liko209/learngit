/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 15:32:51
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteComponentProps } from 'react-router-dom';

type PhoneTabProps = RouteComponentProps;

type PhoneTabViewProps = RouteComponentProps<{ subPath?: string }> & {
  hasSawDialPad: boolean;
  setShowDialPad: () => void;
  currentTab: string;
};

export { PhoneTabProps, PhoneTabViewProps };
