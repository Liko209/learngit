/*
* @Author: Nello Huang (nello.huang@ringcentral.com)
* @Date: 2018-03-29 16:46:06
* Copyright © RingCentral. All rights reserved.
*/
import {
  ISchemaVersions,
  TableSchemaDefinition,
  IParseSchemeCallback,
} from './../db';

/**
 * parse DB schema
 * @param {*} schema
 * @param {*} callback
 */
export const parseSchema = (
  versions: ISchemaVersions,
  callback: IParseSchemeCallback,
) => {
  Object.keys(versions).forEach((version) => {
    Object.keys(versions[version]).forEach((colName) => {
      // const fields = versions[version][colName].map((str: string) =>
      //   str
      //     .trim()
      //     .replace('++', '')
      //     .replace('*', '')
      // );
      const filter = (str: string) =>
        str
          .trim()
          .replace('++', '')
          .replace('*', '');
      const { unique, indices = [] }: TableSchemaDefinition = versions[version][
        colName
];
      callback({
        version,
        colName,
        unique: filter(unique),
        indices: indices.map(indice => filter(indice)),
      });
    });
  });
};
