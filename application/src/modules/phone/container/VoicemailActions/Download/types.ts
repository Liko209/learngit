/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:27:21
 * Copyright © RingCentral. All rights reserved.
 */
import { BUTTON_TYPE } from '../types';

type DownloadProps = {
  id: number;
};

type DownloadViewProps = {
  date: string;
  type: BUTTON_TYPE;
  getUri: () => Promise<string>;
  hookAfterClick: () => void;
};

export { BUTTON_TYPE, DownloadProps, DownloadViewProps };
