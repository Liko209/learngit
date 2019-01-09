/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:36:03
 * Copyright © RingCentral. All rights reserved.
 */
import * as dashboard from './config/dashboard.config';
import * as message from './config/message.config';
import * as phone from './config/phone.config';
import * as meeting from './config/meeting.config';
import * as contact from './config/contact.config';
import * as calendar from './config/calendar.config';
import * as task from './config/task.config';
import * as note from './config/note.config';
import * as file from './config/file.config';
import * as setting from './config/setting.config';

const config = {
  defaultRouterPath: '/messages',
  subModules: [
    // placement: top
    dashboard.config,
    message.config,
    phone.config,
    meeting.config,
    // placement: bottom
    contact.config,
    calendar.config,
    task.config,
    note.config,
    file.config,
    setting.config,
  ],
};

export { config };
