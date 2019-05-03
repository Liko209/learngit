/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:29:41
 * Copyright © RingCentral. All rights reserved.
 */

type ChangeProps = {
  id: number;
};

type ChangeViewProps = {
  changerId: number;
  changerName: string;
  value: string;
  oldValue: string;
  createdAt: string;
};

export { ChangeProps, ChangeViewProps };
