/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:28:56
 * Copyright © RingCentral. All rights reserved.
 */

type IndicatorProps = {
  id: number; // group id
  showUmi: boolean;
};

type IndicatorViewProps = {
  id: number;
  hasDraft: boolean;
  sendFailurePostIds: number[];
  canPost: boolean;
  showUmi: boolean;
};

export { IndicatorProps, IndicatorViewProps };
