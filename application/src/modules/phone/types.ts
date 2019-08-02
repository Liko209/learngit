import { Attachment } from 'sdk/module/RCItems';
import { IMedia } from '@/interface/media';

type Audio = Attachment & {
  vmDuration: number; // audio must has duration
  startTime: number;
  downloadUrl: string;
  media: IMedia;
};

type Checker = (width: number) => boolean;

export { Audio, Checker };
