/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-28 16:59:33
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { IPostParser, ParserType, FileNameParserOption } from '../types';
import { ParseContent } from '../ParseContent';
import { PostParser } from './PostParser';
import { JuiFileNameLeft } from 'jui/pattern/ConversationCard/Files/FileName';

class FileNameParser extends PostParser implements IPostParser {
  type = ParserType.FILE_NAME;
  MAX_FILENAME_LENGTH = 22;
  TAIL_LENGTH = 8;
  content: ParseContent;
  constructor(public options: FileNameParserOption) {
    super(options);
    this.MAX_FILENAME_LENGTH =
      this.options.maxLength || this.MAX_FILENAME_LENGTH;
    this.TAIL_LENGTH = this.options.tailLength || this.TAIL_LENGTH;
  }

  getReplaceElement(strValue: string) {
    let left = '';
    let right = '';
    if (strValue && strValue.length > this.MAX_FILENAME_LENGTH) {
      [left, right] = this._getFileName(strValue);
    } else {
      left = strValue;
    }
    const Children = ({ left, right }: { left: string; right: string }) => {
      const { innerContentParser } = this.options;
      return (
        <>
          <JuiFileNameLeft>
            {innerContentParser ? innerContentParser(left) : left}
          </JuiFileNameLeft>
          <span>{innerContentParser ? innerContentParser(right) : right}</span>
        </>
      );
    };
    return <Children left={left} right={right} />;
  }

  private _getFileName(
    filename: string,
    truncation: number = -this.TAIL_LENGTH,
  ) {
    if (!filename) return '';

    const name = filename;
    const right = name.substr(truncation);
    const left = name.replace(right, '');
    return [left, right];
  }
}

export { FileNameParser };
