/*
 * @Author: Paynter Chen
 * @Date: 2019-08-28 11:33:43
 * Copyright © RingCentral. All rights reserved.
 */

export interface IDataExporter<ExportType> {
  export(): Promise<ExportType>;
}
export interface IDataImporter<ImportType> {
  import(data: ImportType): Promise<void>;

  validate(data: ImportType): Promise<boolean>;
}
