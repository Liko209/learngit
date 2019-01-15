/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:19
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity, IConsoleLogPrettier } from './types';
const COLORS = [
  '#ff8800',
  '#516bf0',
  '#008b8b',
];
export class ConsoleLogPrettier implements IConsoleLogPrettier {

  prettier(logEntity: LogEntity): any[] {
    const { tags, message } = logEntity;
    let params: any[] = [];
    if (tags && tags.length > 0) {
      params = [...this.addColor(tags), ...params];
    }
    return [...params, message];
  }

  addColor(tags: string[]): string[] {
    const tagString = `%c${tags.join('%c ')}`;
    const colors = tags.map((tag, index) => {
      return `color: ${COLORS[index % (COLORS.length)]}`;
    });
    return [tagString, ...colors];
  }
}
