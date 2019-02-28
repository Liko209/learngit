/*
 * @Author: doyle.wu
 * @Date: 2019-02-21 14:50:11
 */
import { Config } from '../config';
import { LogUtils } from '../utils';
import * as bluebird from 'bluebird';

const GatherRunner = require("lighthouse/lighthouse-core/gather/gather-runner");
const TraceProcessor = require("lighthouse/lighthouse-core/lib/traces/tracing-processor");

const logger = LogUtils.getLogger(__filename);

const hackLightHouse = async () => {
  GatherRunner.loadBlank = async (driver) => {
    await driver.gotoURL(Config.blankUrl, { waitForNavigated: true });
    await bluebird.delay(1000);
  };

  TraceProcessor.findMainFrameIds = (events) => {
    const navigationStartEvts = events.filter(e => e.name === 'navigationStart');
    if (!navigationStartEvts || navigationStartEvts.length === 0) {
      logger.warn('there have not navigationStart');
    }
    const startedInBrowserEvts = events.filter(e => e.name === 'TracingStartedInBrowser');
    for (let startedInBrowserEvt of startedInBrowserEvts) {
      if (startedInBrowserEvt && startedInBrowserEvt.args.data &&
        startedInBrowserEvt.args.data.frames) {
        const mainFrame = startedInBrowserEvt.args.data.frames.find(frame => {
          return !frame.parent && !frame.url.startsWith(Config.blankUrl);
        });
        const frameId = mainFrame && mainFrame.frame;
        const pid = mainFrame && mainFrame.processId;
        const tid = startedInBrowserEvt.tid;

        if (pid && tid && frameId) {
          return {
            pid,
            tid,
            frameId,
          };
        }
      }
    }

    const frameCommittedInBrowserEvts = events.filter(e => e.name === 'FrameCommittedInBrowser');
    for (let frameCommittedInBrowserEvt of frameCommittedInBrowserEvts) {
      if (frameCommittedInBrowserEvt && frameCommittedInBrowserEvt.args && frameCommittedInBrowserEvt.args.data) {
        const frameId = frameCommittedInBrowserEvt.args.data.frame;
        const url = frameCommittedInBrowserEvt.args.data.url;
        const pid = frameCommittedInBrowserEvt.args.data.processId;
        if (frameId && pid && url && !url.startsWith(Config.blankUrl)) {
          return {
            pid: pid,
            tid: frameCommittedInBrowserEvt.tid,
            frameId,
          };
        }
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
};


export {
  hackLightHouse
}
