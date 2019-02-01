/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:36
 * Copyright © RingCentral. All rights reserved.
 */
import { Assembler } from './Assembler';

import _ from 'lodash';
import { AssemblerDelFunc, AssemblerAddFunc } from './types';
export class PostCombiner extends Assembler {
  // private _LIMIT: number = 60000;
  onAdd: AssemblerAddFunc = ({
    added,
    postList,
    streamItemList,
    readThrough,
    ...rest
  }) => {
    return {
      streamItemList,
      postList,
      readThrough,
      added,
      ...rest,
    };
  }

  onDelete: AssemblerDelFunc = ({ deleted, streamItemList, ...rest }) => {
    return {
      deleted,
      streamItemList,
      ...rest,
    };
  }
}
