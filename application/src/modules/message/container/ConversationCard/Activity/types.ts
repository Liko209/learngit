/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 19:50:23
 * Copyright © RingCentral. All rights reserved.
 */

type ActivityProps = {
  id: number; // post id
};

type ActivityViewProps = {
  activity: {
    key: string;
    parameter: {
      withTranslationd?: object;
      numerals?: number;
    };
  };
};

export { ActivityProps, ActivityViewProps };
