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
  hasDraft: boolean;
  sendFailurePostIds: number[];
  canPost: boolean;
};

export { IndicatorProps, IndicatorViewProps };
