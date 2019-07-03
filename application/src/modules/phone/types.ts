import { Attachment } from 'sdk/module/RCItems';

type Audio = Attachment & {
  vmDuration: number; // audio must has duration
  startTime: number;
  downloadUrl: string;
};

type Checker = (width: number) => boolean;

export { Audio, Checker };
