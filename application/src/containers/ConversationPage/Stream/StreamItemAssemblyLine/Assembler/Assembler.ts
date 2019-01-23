/*
 * @Author: Andy Hu
 * @Date: 2019-01-08 10:55:28
 * Copyright © RingCentral. All rights reserved.
 */
import { AssemblerAddFunc, AssemblerDelFunc } from './types';

export abstract class Assembler {
  abstract onAdd: AssemblerAddFunc;

  abstract onDelete: AssemblerDelFunc;
}
