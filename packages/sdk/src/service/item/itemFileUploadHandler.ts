/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-05 09:30:00
 */

import { FileItem, StoredFile } from '../../models';

class ItemFileUploadHandler {
  _uploadingFiles: Map<number, FileItem>;
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

  private _toItemFile(groupId: number, file: FormData): File | null {
    return null;
  }

  private _emitItemFileStatus(
    itemId: number,
    totalSize: number,
    uploadedSize: number,
  ) {}

  private _uploadFile(
    file: FormData,
    progressCallback: (totalSize: number, uploadedSize: number) => void,
  ) {}

  private async _newItem(
    groupId: number,
    file: StoredFile,
  ): Promise<FileItem | null> {
    return null;
  }

  private async _updateItem(
    groupId: number,
    file: StoredFile,
  ): Promise<FileItem | null> {
    return null;
  }
}

export { ItemFileUploadHandler };
