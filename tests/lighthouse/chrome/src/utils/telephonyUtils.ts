/*
 * @Author: doyle.wu
 * @Date: 2019-07-11 08:37:34
 */
import axios from 'axios';
import { Config } from '../config';
import { LogUtils } from '.';

const logger = LogUtils.getLogger(__filename);

class PhoneDto {
  _id: string;
  env: string;
  phoneNumber: string;
  sessionId: string;
  TTL: number;
  status: string;
  extension: number;
}

class TelephonyUtils {


  static async closeAllSession(): Promise<void> {
    try {
      let response = await axios.get(`${Config.webPhoneUrl}/api/phone`);
      let list: Array<PhoneDto> = response.data;

      for (let dto of list) {
        if (dto.phoneNumber !== Config.jupiterUser || dto.env !== Config.webPhoneEnv) {
          continue;
        }

        try {
          await axios.post(`${Config.webPhoneUrl}/api/phone/operate`, {
            action: "close",
            sessionId: dto.sessionId,
            _id: dto._id
          });
        } catch (err) {
          logger.error(`Close session failed. Reason: ${err}`);
        }
      }
    } catch (err) {
      logger.error(err);
    }
  }
}


export {
  TelephonyUtils
}
