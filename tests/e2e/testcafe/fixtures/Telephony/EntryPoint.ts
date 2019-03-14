/*
 * @Author: Potar.He 
 * @Date: 2019-03-14 15:24:53 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-14 15:56:35
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';

fixture('Search/Icon')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

