/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:36:03
 * Copyright © RingCentral. All rights reserved.
 */
import { config as dashboard } from './config/dashboard.config';
import { config as message } from './config/message.config';
import { config as telephony } from './config/telephony.config';
import { config as meeting } from './config/meeting.config';
import { config as contact } from './config/contact.config';
import { config as calendar } from './config/calendar.config';
import { config as task } from './config/task.config';
import { config as note } from './config/note.config';
import { config as file } from './config/file.config';
import { config as setting } from './config/setting.config';
import { HomeConfig } from './types';

const config: HomeConfig = {
  defaultRouterPaths: ['/messages', '/phone', '/dashboard'],
  subModules: {
    /*
     * placement: top
     */
    dashboard,
    message,
    telephony,
    meeting,
    /*
     * placement: bottom
     */
    contact,
    calendar,
    task,
    note,
    file,
    setting,
  },
};

export { config };
