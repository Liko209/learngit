/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-08 15:00:53
 * Copyright © RingCentral. All rights reserved.
 */
import { SegAnalysisController } from './SegAnalysisController';

class DataAnalysis {
  private _segAnalysis: SegAnalysisController;
  constructor() {
    this._segAnalysis = new SegAnalysisController();
  }

  init(key: string) {
    this._segAnalysis.init(key);
  }

  setProduction(isProduction: boolean) {
    this._segAnalysis.setProduction(isProduction);
  }

  reset() {
    this._segAnalysis.reset();
  }

  identify(id: number, properties?: any) {
    this._segAnalysis.identify(id, properties);
  }

  page(name: string, properties?: any) {
    this._segAnalysis.page(name, properties);
  }

  track(name: string, properties?: any) {
    this._segAnalysis.track(name, properties);
  }
}

export { DataAnalysis };
