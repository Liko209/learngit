/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 13:58:40
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from '../IProcessor';
import SequenceProcessorHandler from '../SequenceProcessorHandler';

class TestProcessor implements IProcessor {
  private _name: string;
  constructor(name: string) {
    this._name = name;
  }
  name(): string {
    return this._name;
  }

  canContinue(): boolean {
    return true;
  }

  async process(): Promise<boolean> {
    return this._handle();
  }

  private _handle(): boolean {
    // console.log('this._name', this._name);
    return this._name !== '1';
  }
}

describe('SequenceProcessorHandler', () => {
  const pro1 = new TestProcessor('1');
  const pro2 = new TestProcessor('2');
  const handler = new SequenceProcessorHandler('sequenceHandler');
  it('add processor', () => {
    let result = handler.addProcessor(pro1);
    expect(result).toBe(true);

    result = handler.addProcessor(pro2);
    expect(result).toBe(true);

    const processors = handler.getProcessors();
    expect(processors.length).toBe(2);
  });

  it('remove processor', () => {
    const result = handler.removeProcessor(pro1);
    const processors = handler.getProcessors();
    expect(processors.length).toBe(1);
  });

  it('process', async () => {
    let result = await handler.execute();
    expect(result).toBe(true);

    handler.addProcessor(pro1);
    result = await handler.execute();
    expect(result).toBe(false);
  });
});
