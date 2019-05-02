/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { FileService } from '../services';
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");

class MemoryGatherer extends Gatherer {
  private memoryFileArray: Array<string> = new Array();

  async beforePass(passContext) {
  }

  async pass(passContext) {
    const driver = passContext.driver;

    const beforePassMemory = [];
    const listener = (data) => {
      beforePassMemory.push(data.chunk);
    }

    driver.on('HeapProfiler.addHeapSnapshotChunk', listener);

    await driver.sendCommand('HeapProfiler.startTrackingHeapObjects');

    await driver.sendCommand('HeapProfiler.stopTrackingHeapObjects');

    driver.off('HeapProfiler.addHeapSnapshotChunk', listener);

    this.memoryFileArray.push(await FileService.saveHeapIntoDisk(beforePassMemory.join('')));
  }

  async afterPass(passContext) {
    const driver = passContext.driver;

    const afterPassMemory = [];
    const listener = (data) => {
      afterPassMemory.push(data.chunk);
    }

    driver.on('HeapProfiler.addHeapSnapshotChunk', listener);

    await driver.sendCommand('HeapProfiler.startTrackingHeapObjects');

    await driver.sendCommand('HeapProfiler.stopTrackingHeapObjects');

    driver.off('HeapProfiler.addHeapSnapshotChunk', listener);

    this.memoryFileArray.push(await FileService.saveHeapIntoDisk(afterPassMemory.join('')));

    return { data: afterPassMemory, memoryFileArray: this.memoryFileArray };
  }
}

export { MemoryGatherer };
