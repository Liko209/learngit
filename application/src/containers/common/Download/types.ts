/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-12 10:21:37
 * Copyright © RingCentral. All rights reserved.
 */

type DownloadProps = {
  url: string;
  variant?: 'round' | 'plain';
};

type DownloadViewProps = DownloadProps;

export { DownloadProps, DownloadViewProps };
