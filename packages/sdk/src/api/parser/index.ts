import { IResponseParser, ResponseParser } from './types';
import { CommonResponseParser } from './CommonResponseParser';
import { GlipResponseParser } from './GlipResponseParser';
const responseParser = new ResponseParser();
responseParser.register(new GlipResponseParser());
responseParser.register(new CommonResponseParser());

export {
  IResponseParser,
  responseParser,
};
