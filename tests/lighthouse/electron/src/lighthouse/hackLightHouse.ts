/*
 * @Author: doyle.wu
 * @Date: 2019-02-21 14:50:11
 */
import { Config } from '../config';
import { LogUtils } from '../utils';
import * as bluebird from 'bluebird';

const GatherRunner = require("lighthouse/lighthouse-core/gather/gather-runner");
const TraceProcessor = require("lighthouse/lighthouse-core/lib/traces/tracing-processor");
const TraceOfTab = require("lighthouse/lighthouse-core/computed/trace-of-tab");

const logger = LogUtils.getLogger(__filename);

const hackLightHouse = async () => {
  GatherRunner.loadBlank = async (driver) => {
    await driver.gotoURL(Config.blankUrl, { waitForNavigated: true });
    await bluebird.delay(1000);
  };

  TraceProcessor.findMainFrameIds = (events) => {
    const navigationStartEvts = events.filter(e => e.name === 'navigationStart');
    logger.info(`navigationStartEvts:\n${JSON.stringify(navigationStartEvts)}`);
    if (!navigationStartEvts || navigationStartEvts.length === 0) {
      logger.warn('there have not navigationStart');
    }

    // Prefer the newer TracingStartedInBrowser event first, if it exists
    const startedInBrowserEvt = events.find(e => e.name === 'TracingStartedInBrowser');
    if (startedInBrowserEvt && startedInBrowserEvt.args.data &&
      startedInBrowserEvt.args.data.frames) {
      const mainFrame = startedInBrowserEvt.args.data.frames.find(frame => !frame.parent);
      const frameId = mainFrame && mainFrame.frame;
      const pid = mainFrame && mainFrame.processId;

      const threadNameEvt = events.find(e => e.pid === pid && e.ph === 'M' &&
        e.cat === '__metadata' && e.name === 'thread_name' && e.args.name === 'CrRendererMain');
      const tid = threadNameEvt && threadNameEvt.tid;

      if (pid && tid && frameId) {
        return {
          pid,
          tid,
          frameId,
        };
      }
    }

    // Support legacy browser versions that do not emit TracingStartedInBrowser event.
    // The first TracingStartedInPage in the trace is definitely our renderer thread of interest
    // Beware: the tracingStartedInPage event can appear slightly after a navigationStart
    const startedInPageEvt = events.find(e => e.name === 'TracingStartedInPage');
    if (startedInPageEvt && startedInPageEvt.args && startedInPageEvt.args.data) {
      const frameId = startedInPageEvt.args.data.page;
      if (frameId) {
        return {
          pid: startedInPageEvt.pid,
          tid: startedInPageEvt.tid,
          frameId,
        };
      }
    }


    logger.info(`can't find frameId, event:\n${JSON.stringify(events)}`);
    throw new Error('NO_TRACING_STARTED');
  }

  TraceOfTab.isNavigationStartOfInterest = (event) => {
    let url;
    if (event.args.data) {
      url = event.args.data.documentLoaderURL;
    }
    if (!url) {
      url = '';
    }
    return event.name === 'navigationStart' && !url.startsWith(Config.blankUrl);
  }
};


export {
  hackLightHouse
}
