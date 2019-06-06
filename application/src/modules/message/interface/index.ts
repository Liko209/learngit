import { createDecorator } from 'framework';
const IMessageSettingManager = createDecorator('MESSAGE_SETTING_MANAGER');
interface IMessageSettingManager {
  init: Function;
  dispose: Function;
}
export { IMessageSettingManager };
