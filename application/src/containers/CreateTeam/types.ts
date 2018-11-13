/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteComponentProps } from 'react-router-dom';
import { WithNamespaces } from 'react-i18next';

type ViewProps = WithNamespaces & {
  create: Function;
  isOpen: boolean;
  disabledOkBtn: boolean;
  isOffline: boolean;
  nameError: boolean;
  emailError: boolean;
  errorMsg: string;
  emailErrorMsg: string;
  teamName: string;
  description: string;
  serverError: boolean;
  members: (number | string)[];
  updateCreateTeamDialogState: () => void;
  inputReset: () => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchContactChange: (items: any) => void;
} & RouteComponentProps;

export { ViewProps };
