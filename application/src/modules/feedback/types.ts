/*
 * @Author: Paynter Chen
 * @Date: 2019-03-28 15:40:17
 * Copyright © RingCentral. All rights reserved.
 */
export type UploadResult = {
  filename: string;
  handle: string;
  size: number;
  url: string;
};

export type FeedbackData = {
  comments: string;
  event_id: string;
  email: string;
  name: string;
};
