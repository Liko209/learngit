/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogEntityDecorator, LogEntity } from '../types';
enum TYPES {
  String = '[object String]',
  Boolean = '[object Boolean]',
  Number = '[object Number]',
  Object = '[object Object]',
  Function = '[object Function]',
  Undefined = '[object Undefined]',
  Null = '[object Null]',
}

type A = TYPES;
export class StringifyDecorator implements ILogEntityDecorator {
  options: object;
  parserMap: { [key in A]: (item: any) => string };
  constructor() {
    this.parserMap = {
      '[object Object]': (item: object) => {
        try {
          return JSON.stringify(item);
        } catch {
          return '[object Object]';
        }
      },
      '[object String]': (item: string) => {
        return item;
      },
      '[object Function]': (item: Function) => {
        return '[object Function]';
      },
      '[object Undefined]': (item: undefined) => {
        return 'undefined';
      },
      '[object Null]': (item: null) => {
        return 'null';
      },
      '[object Boolean]': (item: boolean) => {
        return String(item);
      },
      '[object Number]': (item: number) => {
        return String(item);
      },
    };
  }

  decorate(data: LogEntity): LogEntity {
    data.params = data.params.map((item: any) => {
      const type = Object.prototype.toString.call(item);
      if (this.parserMap[type]) {
        return this.parserMap[type](item);
      }
      return item ? item.toString() : type;
    });
    return data;
  }
}
