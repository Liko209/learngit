/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-02 19:26:16
 * Copyright © RingCentral. All rights reserved.
 */
import Segment from 'load-segment';
import { AnalysisBaseController } from './AnalysisBaseController';

class SegAnalysisController extends AnalysisBaseController {
  private _segment: TSegment;

  init(key: string) {
    if (key) {
      this._segment = Segment({ key });
    }
  }

  reset() {
    this._segment && this._segment.reset();
  }

  page(name: string, properties?: any) {
    this._segment && this._segment.page(name, this._addEndPoint(properties));
  }

  identify(id: number, properties?: any) {
    this._segment && this._segment.identify(id, this._addEndPoint(properties));
  }

  track(name: string, properties?: any) {
    this._segment && this._segment.track(name, this._addEndPoint(properties));
  }

  private _addEndPoint(options: any = {}) {
    if (options.endPoint) {
      return options;
    }
    options.endPoint = this.getEndPoint();
    return options;
  }
}

export { SegAnalysisController };
