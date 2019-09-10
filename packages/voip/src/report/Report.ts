/*
 * @Author: Spike.Yang
 * @Date: 2019-05-20 10:00:10
 * Copyright © RingCentral. All rights reserved.
 */

import { dataAnalysis } from 'foundation/analysis';

const name = 'Jup_Web/DT_phone_call_media_report';

export default (info: string) => dataAnalysis.track(name, { info, type: 'call' });
