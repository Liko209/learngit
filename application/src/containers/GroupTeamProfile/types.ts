/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { WithNamespaces } from 'react-i18next';

type GroupTeamProps = WithNamespaces & {
  destroy: () => void;
  id: number;
};
enum ID_TYPE  {
  TEAM = 'TEAM',
  GROUP = 'GROUP',
  PERSON = 'PERSON',
}
export { GroupTeamProps, ID_TYPE };
