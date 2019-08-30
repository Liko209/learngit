/*
 * @Author: Paynter Chen
 * @Date: 2019-08-28 09:59:03
 * Copyright © RingCentral. All rights reserved.
 */
import { IDataImporter, IDataExporter } from './types';

type ExportStorage = {
  [key: string]: string | null;
};

export class LocalStorageImportExporter
  implements IDataImporter<string>, IDataExporter<string> {
  async import(data: string): Promise<void> {
    const localStorageJ: ExportStorage = JSON.parse(data);
    Object.keys(localStorageJ).forEach(key => {
      localStorageJ[key] && localStorage.setItem(key, localStorageJ[key]!);
    });
  }

  async validate(data: string): Promise<boolean> {
    return !!data;
  }

  async export(): Promise<string> {
    const obj: ExportStorage = {};
    Object.keys(localStorage).forEach(key => {
      obj[key] = localStorage.getItem(key);
    });
    return JSON.stringify(obj);
  }
}
