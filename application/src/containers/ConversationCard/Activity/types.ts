/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 19:50:23
 * Copyright © RingCentral. All rights reserved.
 */

enum ACTION {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
  SHARED = 'SHARED',
  STARTED = 'STARTED',
  ASSIGNED = 'ASSIGNED',
  REASSIGNED = 'REASSIGNED',
  UPDATED = 'UPDATED',
  REPLIED = 'REPLIED',
  UPLOADED = 'UPLOADED',
  VIA = 'VIA',
}

type ActivityProps = {
  id: number; // post id
};

type ActivityViewProps = {
  activity: {
    action: string;
    type?: string | number;
    quantifier?: number;
  };
};

export { ACTION, ActivityProps, ActivityViewProps };
