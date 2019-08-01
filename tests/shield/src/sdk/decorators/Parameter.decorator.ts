/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:22:18
 * Copyright © RingCentral. All rights reserved.
 */
import {
  META_PARAM_REQUEST,
  META_PARAM_PARAM,
  META_PARAM_CONTEXT,
} from './constants';
import { createParameterDecorator } from './metaUtil';

export const PRequest: ParameterDecorator = createParameterDecorator(
  META_PARAM_REQUEST,
);
export const PParam: ParameterDecorator = createParameterDecorator(
  META_PARAM_PARAM,
);
export const PContext: ParameterDecorator = createParameterDecorator(
  META_PARAM_CONTEXT,
);
