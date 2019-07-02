/*
 * @Author: isaac.liu
 * @Date: 2019-07-02 13:21:16
 * Copyright © RingCentral. All rights reserved.
 */
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn();
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.addTextTrack = jest.fn();
