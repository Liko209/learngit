/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");

class MemoryGatherer extends Gatherer {
  private chunks: Array<string> = new Array();

  async beforePass(passContext) {
  }

  async afterPass(passContext) {
    const driver = passContext.driver;

    driver.on('HeapProfiler.addHeapSnapshotChunk', data => {
      this.chunks.push(data.chunk);
    });

    await driver.sendCommand('HeapProfiler.startTrackingHeapObjects');

    await driver.sendCommand('HeapProfiler.stopTrackingHeapObjects');

    return { data: this.chunks };
  }

  pass(passContext) { }
}

export { MemoryGatherer };
