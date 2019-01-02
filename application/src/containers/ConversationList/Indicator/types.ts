/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:28:56
 * Copyright © RingCentral. All rights reserved.
 */

type IndicatorProps = {
  id: number; // group id
};

type IndicatorViewProps = {
  id: number;
  draft: boolean;
  sendFailurePostIds: number[];
};

export { IndicatorProps, IndicatorViewProps };
