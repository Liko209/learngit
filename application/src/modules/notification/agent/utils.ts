import { noop } from 'jui/foundation/utils';
import { NotificationAction } from '../interface';

export const buildAction = ({
  action = '',
  handler = noop,
  title = '',
  icon = '',
}: any) => {
  return {
    action,
    title,
    icon,
    handler,
  } as NotificationAction;
};
