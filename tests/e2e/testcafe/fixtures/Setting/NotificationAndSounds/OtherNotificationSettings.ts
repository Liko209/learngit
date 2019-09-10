/*
 * @Author: Andy Hu(andy.hu@ringcentral.com)
 * @Date: 2018-10-25 13:44:44
 * Copyright Â© RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { AppRoot } from '../../../v2/page-models/AppRoot/index';
import { h, H } from '../../../v2/helpers';
import { teardownCase, setupCase } from '../../../init';
import { BrandTire, SITE_URL } from '../../../config';
import { IGroup, ITestMeta } from '../../../v2/models';

fixture('ConversationStream/ConversationStream')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

