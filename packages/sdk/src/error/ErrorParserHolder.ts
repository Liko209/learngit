import { IErrorParser, ErrorParser, RuntimeErrorParser } from 'foundation/error';
import { DBErrorParser } from './db';

export class ErrorParserHolder {
  private static _errorParser: ErrorParser;

  static getErrorParser(): ErrorParser {
    if (!ErrorParserHolder._errorParser) {
      ErrorParserHolder._errorParser = new ErrorParser();
      ErrorParserHolder._init();
    }

    return ErrorParserHolder._errorParser;
  }

  private static _init() {
    ErrorParserHolder._errorParser.register(new RuntimeErrorParser());
    ErrorParserHolder._errorParser.register(new DBErrorParser());
  }

  static register(parser: IErrorParser) {
    ErrorParserHolder.getErrorParser();
    ErrorParserHolder._errorParser.register(parser);
  }
}
