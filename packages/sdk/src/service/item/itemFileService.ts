/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-05 09:30:00
 */

import { FileItem } from '../../models';

class ItemFileService {
  async sendItemFile(
    groupId: number,
    file: FormData,
    isUpdate: boolean,
  ): Promise<FileItem | null> {
    return null;
  }

  async cancelUpload(itemId: number): Promise<boolean> {
    return false;
  }

  getUploadItems(): File[] {
    return null;
  }

  async isFileExists(groupId: string, fileName: string): Promise<boolean> {
    return false;
  }

  getUploadProgress(itemId: number): number {
    return 0;
  }
}

export { ItemFileService };
