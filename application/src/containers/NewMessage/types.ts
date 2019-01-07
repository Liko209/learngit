/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-22 09:55:50
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteComponentProps } from 'react-router-dom';

type ViewProps = {
  newMessage: Function;
  isOpen: boolean;
  disabledOkBtn: boolean;
  isOffline: boolean;
  errorUnknown: boolean;
  emailError: boolean;
  emailErrorMsg: string;
  message: string;
  serverError: boolean;
  members: (number | string)[];
  errorEmail: string;
  handleSearchContactChange: (items: any) => void;
} & RouteComponentProps;

export { ViewProps };
