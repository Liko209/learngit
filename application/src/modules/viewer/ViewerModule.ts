/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractModule, inject, Jupiter } from 'framework';
import { IViewerService, VIEWER_SERVICE } from './interface';

class ViewerModule extends AbstractModule {
  @inject(VIEWER_SERVICE) _viewerService: IViewerService;
  @inject(Jupiter) private _jupiter: Jupiter;

  bootstrap() {
    console.log(this._jupiter, 'looper2eooo');
    setTimeout(() => {
      this._viewerService.showFileViewer();
    },         3000);
  }
}
export { ViewerModule };
