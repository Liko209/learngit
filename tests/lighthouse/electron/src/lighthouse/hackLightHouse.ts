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
const Sentry = require('lighthouse/lighthouse-core/lib/sentry.js');

const logger = LogUtils.getLogger(__filename);

const hackLightHouse = async () => {
  GatherRunner.loadBlank = async (driver) => {
    await driver.gotoURL(Config.blankUrl, { waitForNavigated: true });
    await bluebird.delay(1000);
  };

  TraceProcessor.findMainFrameIds = (events) => {
    // logger.info(`findMainFrameIds:\n${JSON.stringify(events)}`);
    const navigationStartEvts = events.filter(e => e.name === 'navigationStart');
    logger.info(`navigationStartEvts:\n${JSON.stringify(navigationStartEvts)}`);
    if (!navigationStartEvts || navigationStartEvts.length === 0) {
      logger.warn('there have not navigationStart');
    }

    const frameCommittedInBrowserEvt = events.find(e => e.name === 'FrameCommittedInBrowser');
    if (frameCommittedInBrowserEvt && frameCommittedInBrowserEvt.args.data) {
      const frameId = frameCommittedInBrowserEvt.args.data.frame;
      const pid = frameCommittedInBrowserEvt.args.data.processId;

      const threadNameEvt = events.find(e => e.pid === pid && e.ph === 'M' &&
        e.cat === '__metadata' && e.name === 'thread_name' && e.args.name === 'CrRendererMain');
      const tid = threadNameEvt && threadNameEvt.tid;

      if (pid && tid && frameId) {
        let res = {
          pid,
          tid,
          frameId,
        };
        logger.info(`findMainFrameIds - FrameCommittedInBrowser:\n${JSON.stringify(res)}`);
        return res;
      }
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
        let res = {
          pid,
          tid,
          frameId,
        };
        logger.info(`findMainFrameIds - TracingStartedInBrowser:\n${JSON.stringify(res)}`);
        return res;
      }
    }

    // Support legacy browser versions that do not emit TracingStartedInBrowser event.
    // The first TracingStartedInPage in the trace is definitely our renderer thread of interest
    // Beware: the tracingStartedInPage event can appear slightly after a navigationStart
    const startedInPageEvt = events.find(e => e.name === 'TracingStartedInPage');
    if (startedInPageEvt && startedInPageEvt.args && startedInPageEvt.args.data) {
      const frameId = startedInPageEvt.args.data.page;
      if (frameId) {
        let res = {
          pid: startedInPageEvt.pid,
          tid: startedInPageEvt.tid,
          frameId,
        }
        logger.info(`findMainFrameIds - TracingStartedInPage:\n${JSON.stringify(res)}`);
        return res;
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

  TraceOfTab.compute_ = async (trace) => {
    // console.log(trace.traceEvents);
    // Parse the trace for our key events and sort them by timestamp. Note: sort
    // *must* be stable to keep events correctly nested.
    const keyEvents = TraceOfTab.filteredStableSort(trace.traceEvents, e => {
      return e.cat.includes('blink.user_timing') ||
        e.cat.includes('loading') ||
        e.cat.includes('devtools.timeline') ||
        e.cat === '__metadata';
    });

    // Find the inspected frame
    const mainFrameIds = TraceProcessor.findMainFrameIds(keyEvents);

    // Filter to just events matching the frame ID for sanity
    const frameEvents = keyEvents.filter(e => e.pid === mainFrameIds.pid && e.tid === mainFrameIds.tid);
    // logger.log(`frameEvents ->  ${JSON.stringify(frameEvents)}`);
    // Our navStart will be the last frame navigation in the trace
    const navigationStart = frameEvents.find(TraceOfTab.isNavigationStartOfInterest);
    logger.log(`navigationStart -> ${JSON.stringify(navigationStart)}`);
    if (!navigationStart) throw new Error('LHError.errors.NO_NAVSTART');

    // Find our first paint of this frame
    const firstPaint = frameEvents.find(e => e.name === 'firstPaint' && e.ts > navigationStart.ts);

    // FCP will follow at/after the FP. Used in so many places we require it.
    const firstContentfulPaint = frameEvents.find(
      e => e.name === 'firstContentfulPaint' && e.ts > navigationStart.ts
    );
    if (!firstContentfulPaint) throw new Error('LHError.errors.NO_FCP');

    // fMP will follow at/after the FP
    let firstMeaningfulPaint = frameEvents.find(
      e => e.name === 'firstMeaningfulPaint' && e.ts > navigationStart.ts
    );
    let fmpFellBack = false;

    // If there was no firstMeaningfulPaint event found in the trace, the network idle detection
    // may have not been triggered before Lighthouse finished tracing.
    // In this case, we'll use the last firstMeaningfulPaintCandidate we can find.
    // However, if no candidates were found (a bogus trace, likely), we fail.
    if (!firstMeaningfulPaint) {
      // Track this with Sentry since it's likely a bug we should investigate.
      Sentry.captureMessage('No firstMeaningfulPaint found, using fallback', { level: 'warning' });

      const fmpCand = 'firstMeaningfulPaintCandidate';
      fmpFellBack = true;
      logger.info(`No firstMeaningfulPaint found, falling back to last ${fmpCand}`);
      const lastCandidate = frameEvents.filter(e => e.name === fmpCand).pop();
      if (!lastCandidate) {
        logger.info('No `firstMeaningfulPaintCandidate` events found in trace');
      }
      firstMeaningfulPaint = lastCandidate;
    }

    const load = frameEvents.find(e => e.name === 'loadEventEnd' && e.ts > navigationStart.ts);
    const domContentLoaded = frameEvents.find(
      e => e.name === 'domContentLoadedEventEnd' && e.ts > navigationStart.ts
    );

    // subset all trace events to just our tab's process (incl threads other than main)
    // stable-sort events to keep them correctly nested.
    const processEvents = TraceOfTab
      .filteredStableSort(trace.traceEvents, e => e.pid === mainFrameIds.pid);

    const mainThreadEvents = processEvents
      .filter(e => e.tid === mainFrameIds.tid);

    // traceEnd must exist since at least navigationStart event was verified as existing.
    const traceEnd = trace.traceEvents.reduce((max, evt) => {
      return max.ts > evt.ts ? max : evt;
    });
    const fakeEndOfTraceEvt = { ts: traceEnd.ts + (traceEnd.dur || 0) };

    /** @param {{ts: number}=} event */
    const getTimestamp = (event) => event && event.ts;
    /** @type {LH.Artifacts.TraceTimes} */
    const timestamps = {
      navigationStart: navigationStart.ts,
      firstPaint: getTimestamp(firstPaint),
      firstContentfulPaint: firstContentfulPaint.ts,
      firstMeaningfulPaint: getTimestamp(firstMeaningfulPaint),
      traceEnd: fakeEndOfTraceEvt.ts,
      load: getTimestamp(load),
      domContentLoaded: getTimestamp(domContentLoaded),
    };


    /** @param {number} ts */
    const getTiming = (ts) => (ts - navigationStart.ts) / 1000;
    /** @param {number=} ts */
    const maybeGetTiming = (ts) => ts === undefined ? undefined : getTiming(ts);
    /** @type {LH.Artifacts.TraceTimes} */
    const timings = {
      navigationStart: 0,
      firstPaint: maybeGetTiming(timestamps.firstPaint),
      firstContentfulPaint: getTiming(timestamps.firstContentfulPaint),
      firstMeaningfulPaint: maybeGetTiming(timestamps.firstMeaningfulPaint),
      traceEnd: getTiming(timestamps.traceEnd),
      load: maybeGetTiming(timestamps.load),
      domContentLoaded: maybeGetTiming(timestamps.domContentLoaded),
    };

    return {
      timings,
      timestamps,
      processEvents,
      mainThreadEvents,
      mainFrameIds,
      navigationStartEvt: navigationStart,
      firstPaintEvt: firstPaint,
      firstContentfulPaintEvt: firstContentfulPaint,
      firstMeaningfulPaintEvt: firstMeaningfulPaint,
      loadEvt: load,
      domContentLoadedEvt: domContentLoaded,
      fmpFellBack,
    };
  }
};


export {
  hackLightHouse
}
