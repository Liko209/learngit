/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 16:20:19
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteComponentProps } from 'react-router-dom';

type ContactTabProps = RouteComponentProps;

type ContactTabViewProps = RouteComponentProps<{ subPath?: string }> & {
  updateCurrentUrl: (path: string) => void;
};

enum NavType {
  all = 'allContacts',
  company = 'companyDirectory',
}

export { ContactTabProps, ContactTabViewProps, NavType };
