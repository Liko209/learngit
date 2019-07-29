/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:15:25
 * Copyright © RingCentral. All rights reserved.
 */
import { ErrorParser } from '../ErrorParser';
import { IErrorParser } from '../IErrorParser';
import { JError } from '../JError';

class MockParser implements IErrorParser {
  constructor(public name: string) {}
  getName = () => this.name;
  parse = jest.fn().mockReturnValue(null);
}

describe('ErrorParser', () => {
  describe('register()', () => {
    it('should register work', async () => {
      const errorParser = new ErrorParser();
      const parser1 = new MockParser('1');
      const parser2 = new MockParser('2');
      errorParser.register(parser1);
      errorParser.register(parser2);
      const error = new Error('hi');
      errorParser.parse(error);
      expect(parser1.parse).toBeCalledWith(error);
      expect(parser2.parse).toBeCalledWith(error);
    });
    it('should replace parser while parser with same name is registered', async () => {
      const errorParser = new ErrorParser();
      const parser1 = new MockParser('1');
      const parser2 = new MockParser('2');
      const parser3 = new MockParser('2');
      errorParser.register(parser1);
      errorParser.register(parser2);
      errorParser.register(parser3);
      const error = new Error('hi');
      errorParser.parse(error);
      expect(parser1.parse).toBeCalledWith(error);
      expect(parser2.parse).toBeCalledTimes(0);
      expect(parser3.parse).toBeCalledWith(error);
    });
  });

  describe('parse()', () => {
    it('should parse by all parser', () => {
      const errorParser = new ErrorParser();
      const parser1 = new MockParser('1');
      const parser2 = new MockParser('2');
      const parser3 = new MockParser('3');
      errorParser.register(parser1);
      errorParser.register(parser2);
      errorParser.register(parser3);
      const error = new Error('hi');
      errorParser.parse(error);
      expect(parser1.parse).toBeCalledWith(error);
      expect(parser2.parse).toBeCalledWith(error);
      expect(parser3.parse).toBeCalledWith(error);
    });
    it('should stop parse when one parser return', () => {
      const errorParser = new ErrorParser();
      const parser1 = new MockParser('1');
      const parser2 = new MockParser('2');
      const parser3 = new MockParser('3');
      parser2.parse.mockReturnValue(new JError('test', 'test', 'test'));
      errorParser.register(parser1);
      errorParser.register(parser2);
      errorParser.register(parser3);
      const error = new Error('hi');
      errorParser.parse(error);
      expect(parser1.parse).toBeCalledWith(error);
      expect(parser2.parse).toBeCalledWith(error);
      expect(parser3.parse).toBeCalledTimes(0);
    });
  });
});
