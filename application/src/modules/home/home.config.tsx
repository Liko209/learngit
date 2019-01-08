import * as dashboard from './configs/dashboard.config';
import * as message from './configs/message.config';
import * as phone from './configs/phone.config';
import * as meeting from './configs/meeting.config';
import * as contact from './configs/contact.config';
import * as calendar from './configs/calendar.config';
import * as task from './configs/task.config';
import * as note from './configs/note.config';
import * as file from './configs/file.config';
import * as setting from './configs/setting.config';

const config = {
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
