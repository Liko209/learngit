/*
 * @Author: Aaron Huo(aaron.huo@ringcentral.com)
 * @Date: 2019-08-22 15:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import moment from 'moment';

const formatSeconds = (seconds = 0, format = 'mm:ss'): string =>
  moment()
    .minute(0)
    .second(seconds)
    .format(format);

export { formatSeconds };
