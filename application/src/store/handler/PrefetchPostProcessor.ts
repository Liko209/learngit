import { IProcessor } from 'sdk/src/framework/processor/IProcessor';

export default class PrefetchPostProcessor implements IProcessor {
  constructor(
    private _groupId: number,
    private _fetchFunc: (groupId: number) => Promise<boolean>,
  ) {}

  async process(): Promise<boolean> {
    return await this._fetchFunc(this._groupId);
  }
  canContinue(): boolean {
    return true;
  }
  name(): string {
    return `${this._groupId}`;
  }
}
