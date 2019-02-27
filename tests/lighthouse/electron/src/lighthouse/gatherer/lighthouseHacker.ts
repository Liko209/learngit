/*
 * @Author: doyle.wu
 * @Date: 2019-02-26 10:03:28
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");

class LighthouseHacker extends Gatherer {
  private isClean: boolean;

  constructor(isClean: boolean = true) {
    super()
    this.isClean = isClean;
  }

  async beforePass(passContext) {
    const driver = passContext.driver;
    const traceEvents = [];
    const dataListener = data => {
      traceEvents.push(...data.value);
    };

    driver.beginTrace = async (settings) => {
      const additionalCategories = (settings && settings.additionalTraceCategories &&
        settings.additionalTraceCategories.split(',')) || [];
      const traceCategories = driver._traceCategories.concat(additionalCategories);

      // In Chrome <71, gotta use the chatty 'toplevel' cat instead of our own.
      // TODO(COMPAT): Once m71 ships to stable, drop this section
      const milestone = (await driver.getBrowserVersion()).milestone;
      if (milestone < 71) {
        const toplevelIndex = traceCategories.indexOf('disabled-by-default-lighthouse');
        traceCategories[toplevelIndex] = 'toplevel';
      }

      const uniqueCategories = Array.from(new Set(traceCategories));

      // Check any domains that could interfere with or add overhead to the trace.
      if (driver.isDomainEnabled('Debugger')) {
        throw new Error('Debugger domain enabled when starting trace');
      }
      if (driver.isDomainEnabled('CSS')) {
        throw new Error('CSS domain enabled when starting trace');
      }
      if (driver.isDomainEnabled('DOM')) {
        throw new Error('DOM domain enabled when starting trace');
      }

      driver.on('Tracing.dataCollected', dataListener);

      // Enable Page domain to wait for Page.loadEventFired
      return driver.sendCommand('Page.enable')
        .then(_ => driver.sendCommand('Tracing.start', {
          categories: uniqueCategories.join(','),
          options: 'sampling-frequency=10000', // 1000 is default and too slow.
        }));
    }

    driver.endTrace = async () => {
      return new Promise((resolve, reject) => {
        driver.once('Tracing.tracingComplete', _ => {
          driver.off('Tracing.dataCollected', dataListener);
          resolve({ traceEvents });
        });

        return driver.sendCommand('Tracing.end').catch(reject);
      });
    }
    if (this.isClean) {
      await driver.cleanBrowserCaches();
    }
  }

  afterPass(passContext) {
    return {};
  }

  pass(passContext) { }
}

export { LighthouseHacker };
