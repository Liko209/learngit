/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-30 14:14:47
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationBrowserSettingItemViewModel } from '../NotificationBrowserSettingItem.ViewModel';
jest.mock('@/utils/i18nT', () => (key: string) => key);

// alessia[todo]: mock getEntity 的值，判断是否去 request 或者 openDialog
