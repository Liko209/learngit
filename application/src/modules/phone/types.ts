import { Attachment } from 'sdk/module/RCItems';

type Audio = Attachment & {
  vmDuration: number; // audio must has duration
  startTime: number;
  downloadUrl: string;
};

export { Audio };
