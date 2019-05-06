import { zip } from '../zip.worker';
import JSZip from 'jszip';

jest.mock('jszip', () => {
  const mock = {
    file: jest.fn(),
    folder: () => mock,
    generateAsync: jest.fn().mockImplementation(() => {}),
  };
  return () => mock;
});

describe('zip.worker', () => {
  describe('zip()', () => {
    it('should add zips', async () => {
      const jsZip = new JSZip();
      jest.clearAllMocks();
      jest.spyOn(jsZip, 'folder');
      const result = await zip([
        {
          type: '.txt',
          name: 'a',
          content: 'content',
        },
        {
          type: '.txt',
          name: 'b',
          content: 'content',
        },
      ]);
      expect(jsZip.file).toHaveBeenNthCalledWith(1, 'a.txt', 'content');
      expect(jsZip.file).toHaveBeenNthCalledWith(2, 'b.txt', 'content');
    });
    it('should add index when name duplicate', async () => {
      const jsZip = new JSZip();
      jest.clearAllMocks();
      jest.spyOn(jsZip, 'folder');
      const result = await zip([
        {
          type: '.txt',
          name: 'a',
          content: 'content',
          folder: 'zip',
        },
        {
          type: '.txt',
          name: 'a',
          content: 'content',
          folder: 'zip',
        },
      ]);
      expect(jsZip.folder).toBeCalledTimes(2);
      expect(jsZip.file).toHaveBeenNthCalledWith(1, 'a.txt', 'content');
      expect(jsZip.file).toHaveBeenNthCalledWith(2, 'a-2.txt', 'content');
    });
  });
});
