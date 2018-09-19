/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-18 15:09:34
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';

class ViewModel {
  private _postService: service.PostService;
  private _id: number;

  constructor(id: number) {
    this._id = id;
    this._postService = service.PostService.getInstance();
  }

  async resend() {
    try {
      await this._postService.reSendPost(this._id);
    } catch (e) {
      // todo use Toast component display code 5000 error
    }
  }

  async delete() {
    try {
      await this._postService.deletePost(this._id);
    } catch (e) {
      // todo use Toast component display code 5000 error
    }
  }
}

export default ViewModel;
