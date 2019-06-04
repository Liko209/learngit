import { IResponseParser, ResponseParser } from './types';
import { CommonResponseParser } from './CommonResponseParser';
import { GlipResponseParser } from './GlipResponseParser';
import { RCResponseParser } from './RCResponseParser';

const responseParser = new ResponseParser();
responseParser.register(new GlipResponseParser());
responseParser.register(new RCResponseParser());
responseParser.register(new CommonResponseParser());

export { IResponseParser, responseParser };
