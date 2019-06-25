/*
 * @Author: doyle.wu
 * @Date: 2019-05-31 08:48:01
 */

const _parsedCategories = new Map<string, Set<string>>();

const _parsedCategoriesForString = (str) => {
  let parsedCategories = _parsedCategories.get(str);
  if (!parsedCategories) {
    parsedCategories = new Set(str ? str.split(',') : []);
    _parsedCategories.set(str, parsedCategories);
  }
  return parsedCategories;
}

const _extractId = (payload) => {
  const scope = payload.scope || '';
  if (typeof payload.id2 === 'undefined') {
    return scope && payload.id ? `${scope}@${payload.id}` : payload.id;
  }
  const id2 = payload.id2;
  if (typeof id2 === 'object' && ('global' in id2) !== ('local' in id2)) {
    return typeof id2['global'] !== 'undefined' ? `:${scope}:${id2['global']}` :
      `:${scope}:${payload.pid}:${id2['local']}`;
  }
  return undefined;
}

const LegacyTopLevelEventCategory = 'toplevel';
const DevToolsMetadataEventCategory = 'disabled-by-default-devtools.timeline';
const DevToolsTimelineEventCategory = 'disabled-by-default-devtools.timeline';
const FrameLifecycleEventCategory = 'cc,devtools';

enum Phase {
  Begin = 'B',
  End = 'E',
  Complete = 'X',
  Instant = 'I',
  AsyncBegin = 'S',
  AsyncStepInto = 'T',
  AsyncStepPast = 'p',
  AsyncEnd = 'F',
  NestableAsyncBegin = 'b',
  NestableAsyncEnd = 'e',
  NestableAsyncInstant = 'n',
  FlowBegin = 's',
  FlowStep = 't',
  FlowEnd = 'f',
  Metadata = 'M',
  Counter = 'C',
  Sample = 'P',
  CreateObject = 'N',
  SnapshotObject = 'O',
  DeleteObject = 'D'
}

enum MetadataEvent {
  ProcessSortIndex = 'process_sort_index',
  ProcessName = 'process_name',
  ThreadSortIndex = 'thread_sort_index',
  ThreadName = 'thread_name'
};

class Thread {
  public _id: number;
  public _name: string;
  public _sortIndex: number;
  public _process: Process;
  public _events: Array<Event>;
  public _asyncEvents: Array<Event>;
  public _lastTopLevelEvent: Event;
  public _model: TracingModel;

  constructor(process: Process, id) {
    this._id = id;
    this._name = '';
    this._sortIndex = 0;
    this._model = process._model;
    this._process = process;
    this._events = [];
    this._asyncEvents = [];
    this._lastTopLevelEvent = null;
  }

  id() {
    return this._id;
  }

  _setName(name) {
    this._name = name;
    this._process._setThreadByName(name, this);
  }

  name() {
    return this._name;
  }

  process(): Process {
    return this._process;
  }

  _setSortIndex(sortIndex) {
    this._sortIndex = sortIndex;
  }

  _addEvent(payload) {
    const event = payload.ph === Phase.SnapshotObject ?
      ObjectSnapshot.fromPayload(payload, this) :
      Event.fromPayload(payload, this);
    if (TracingModel.isTopLevelEvent(event)) {
      // Discard nested "top-level" events.
      if (this._lastTopLevelEvent && this._lastTopLevelEvent.endTime > event.startTime)
        return null;
      this._lastTopLevelEvent = event;
    }
    this._events.push(event);
    return event;
  }

  static _sort(array: Array<Thread>) {
    return array.sort((a, b) => {
      return a._sortIndex !== b._sortIndex ? a._sortIndex - b._sortIndex : a.name().localeCompare(b.name());
    });
  }

  tracingComplete() {
    this._asyncEvents.sort(Event.compareStartTime);
    this._events.sort(Event.compareStartTime);
    const phases = Phase;
    const stack: Array<Event> = [];
    const newArr = [];
    for (let i = 0; i < this._events.length; ++i) {
      const e = this._events[i];
      e.ordinal = i;

      if (e.phase === phases.End) {
        this._events[i] = null;  // Mark for removal.
        // Quietly ignore unbalanced close events, they're legit (we could have missed start one).
        if (!stack.length)
          continue;
        const top = stack.pop();
        if (top.name !== e.name || top.categoriesString !== e.categoriesString) {
          // console.error(
          //   'B/E events mismatch at ' + top.startTime + ' (' + top.name + ') vs. ' + e.startTime + ' (' + e.name +
          //   ')');
        } else {
          top._complete(e);
        }
        continue;
      }

      newArr.push(e);
      if (e.phase === phases.Begin) {
        stack.push(e);
      }
    }
    while (stack.length) {
      stack.pop().setEndTime(this._model.maximumRecordTime());
    }
    this._events = newArr;
  }

  _addAsyncEvent(asyncEvent) {
    this._asyncEvents.push(asyncEvent);
  }
}

class Process {
  public _id: any;
  public _model: TracingModel;
  public _name: string;
  public _sortIndex: number;
  public _threads: Map<number, Thread>;
  public _threadByName: Map<string, Thread>;

  constructor(model: TracingModel, id) {
    this._id = id;
    this._model = model;
    this._name = '';
    this._sortIndex = 0;

    this._threads = new Map();
    this._threadByName = new Map();
  }

  static _sort(array: Array<Process>) {
    return array.sort((a, b) => {
      return a._sortIndex !== b._sortIndex ? a._sortIndex - b._sortIndex : a.name().localeCompare(b.name());
    });
  }

  sortedThreads() {
    let arr = [];
    this._threads.forEach(val => {
      arr.push(val);
    })
    return Thread._sort(arr);
  }

  id() {
    return this._id;
  }

  threadById(id): Thread {
    let thread = this._threads.get(id);
    if (!thread) {
      thread = new Thread(this, id);
      this._threads.set(id, thread);
    }
    return thread;
  }

  threadByName(name) {
    return this._threadByName.get(name) || null;
  }

  _setThreadByName(name, thread) {
    this._threadByName.set(name, thread);
  }

  _setName(name: string) {
    this._name = name;
  }

  name(): string {
    return this._name;
  }

  _setSortIndex(sortIndex: number) {
    this._sortIndex = sortIndex;
  }

  _addEvent(payload) {
    return this.threadById(payload.tid)._addEvent(payload);
  }
}

class Event {
  public id: string;
  public ordinal: number;
  public categoriesString: string;
  public _parsedCategories: Set<string>
  public name: string;
  public phase: Phase;
  public startTime: number;
  public thread: Thread;
  public args: any;
  public selfTime: number;
  public bind_id: any;
  public endTime: number;
  public duration: number;

  constructor(categories: string, name: string, phase: Phase, startTime: number, thread: Thread) {
    this.categoriesString = categories || '';
    this._parsedCategories = _parsedCategoriesForString(this.categoriesString);
    this.name = name;
    this.phase = phase;
    this.startTime = startTime;
    this.thread = thread;
    this.args = {};
    this.selfTime = 0;
  }

  json(): {} {
    return {
      id: this.id,
      ordinal: this.ordinal,
      name: this.name,
      phase: this.phase,
      startTime: this.startTime,
      args: this.args,
      selfTime: this.selfTime,
      endTime: this.endTime,
      duration: this.duration,
    }
  }

  static fromPayload(payload, thread: Thread) {
    const event = new Event(payload.cat, payload.name, payload.ph, payload.ts / 1000, thread);
    if (payload.args) {
      event.addArgs(payload.args);
    }
    if (typeof payload.dur === 'number') {
      event.setEndTime((payload.ts + payload.dur) / 1000);
    }
    const id = _extractId(payload);
    if (typeof id !== 'undefined')
      event.id = id;
    if (payload.bind_id)
      event.bind_id = payload.bind_id;

    return event;
  }

  static compareStartTime(a: Event, b: Event) {
    return a.startTime - b.startTime;
  }

  static orderedCompareStartTime(a: Event, b: Event) {
    return a.startTime - b.startTime || a.ordinal - b.ordinal || -1;
  }

  hasCategory(categoryName) {
    return this._parsedCategories.has(categoryName);
  }

  setEndTime(endTime) {
    if (endTime < this.startTime) {
      console.assert(false, 'Event out of order: ' + this.name);
      return;
    }
    this.endTime = endTime;
    this.duration = endTime - this.startTime;
  }

  addArgs(args) {
    for (const name in args) {
      this.args[name] = args[name];
    }
  }

  _complete(endEvent: Event) {
    if (endEvent.args) {
      this.addArgs(endEvent.args);
    }
    this.setEndTime(endEvent.startTime);
  }
}

class ObjectSnapshot extends Event {
  public _objectPromise;
  constructor(category, name, startTime, thread) {
    super(category, name, Phase.SnapshotObject, startTime, thread);
  }

  static fromPayload(payload, thread) {
    const snapshot = new ObjectSnapshot(payload.cat, payload.name, payload.ts / 1000, thread);
    const id = _extractId(payload);
    if (typeof id !== 'undefined')
      snapshot.id = id;
    if (!payload.args || !payload.args['snapshot']) {
      console.error('Missing mandatory \'snapshot\' argument at ' + payload.ts / 1000);
      return snapshot;
    }
    if (payload.args)
      snapshot.addArgs(payload.args);
    return snapshot;
  }
}

class AsyncEvent extends Event {
  public steps: Array<Event>;

  constructor(startEvent: Event) {
    super(startEvent.categoriesString, startEvent.name, startEvent.phase, startEvent.startTime, startEvent.thread);
    this.addArgs(startEvent.args);
    this.steps = [startEvent];
  }

  _addStep(event) {
    this.steps.push(event);
    if (event.phase === Phase.AsyncEnd || event.phase === Phase.NestableAsyncEnd) {
      this.setEndTime(event.startTime);
      this.steps[0].setEndTime(event.startTime);
    }
  }
}

class ProfileEventsGroup {
  public children: Array<Event>;
  constructor(event) {
    this.children = [event];
  }

  _addChild(event) {
    this.children.push(event);
  }
};

class TracingModel {
  public _processById: Map<number, Process>;
  public _processByName: Map<string, Process>;
  public _minimumRecordTime: number;
  public _maximumRecordTime: number;
  public _devToolsMetadataEvents: Array<Event>;
  public _asyncEvents: Array<Event>;
  public _openAsyncEvents: Map<string, AsyncEvent>;
  public _openNestableAsyncEvents: Map<string, Array<AsyncEvent>>;
  public _profileGroups: Map<string, ProfileEventsGroup>;

  constructor() {
    this._processById = new Map();
    this._processByName = new Map();
    this._minimumRecordTime = 0;
    this._maximumRecordTime = 0;
    this._devToolsMetadataEvents = [];
    this._asyncEvents = [];
    this._openAsyncEvents = new Map();
    this._openNestableAsyncEvents = new Map();
    this._profileGroups = new Map();
  }

  static isNestableAsyncPhase(phase: Phase) {
    return phase === Phase.NestableAsyncBegin || phase === Phase.NestableAsyncEnd || phase === Phase.NestableAsyncInstant;
  }

  static isAsyncBeginPhase(phase: Phase) {
    return phase === Phase.AsyncBegin || phase === Phase.NestableAsyncBegin;
  }

  static isAsyncPhase(phase: Phase) {
    return TracingModel.isNestableAsyncPhase(phase) || phase === Phase.AsyncBegin
      || phase === Phase.AsyncStepInto || phase === Phase.AsyncEnd || phase === Phase.AsyncStepPast;
  }

  static isFlowPhase(phase: Phase) {
    return phase === Phase.FlowBegin || phase === Phase.FlowStep || phase === Phase.FlowEnd;
  }

  static isTopLevelEvent(event: Event) {
    return event.hasCategory(DevToolsTimelineEventCategory) && event.name === 'RunTask' ||
      event.hasCategory(LegacyTopLevelEventCategory) ||
      event.hasCategory(DevToolsMetadataEventCategory) &&
      event.name === 'Program';
  }

  addEvents(events: Array<any>) {
    for (let event of events) {
      this._addEvent(event);
    }
  }

  sortedProcesses() {
    let arr = [];
    this._processById.forEach(val => {
      arr.push(val);
    })
    return Process._sort(arr);
  }

  static browserMainThread(tracingModel: TracingModel): Thread {
    const processes = tracingModel.sortedProcesses();
    // Avoid warning for an empty model.
    if (!processes.length)
      return null;
    const browserMainThreadName = 'CrBrowserMain';
    const browserProcesses = [];
    const browserMainThreads = [];
    for (const process of processes) {
      if (process.name().toLowerCase().endsWith('browser')) {
        browserProcesses.push(process);
      }
      browserMainThreads.push(...process.sortedThreads().filter(t => t.name() === browserMainThreadName));
    }
    if (browserMainThreads.length === 1)
      return browserMainThreads[0];
    if (browserProcesses.length === 1)
      return browserProcesses[0].threadByName(browserMainThreadName);
    const tracingStartedInBrowser =
      tracingModel.devToolsMetadataEvents().filter(e => e.name === 'TracingStartedInBrowser');
    if (tracingStartedInBrowser.length === 1)
      return tracingStartedInBrowser[0].thread;
    console.error('Failed to find browser main thread in trace, some timeline features may be unavailable');
    return null;
  }

  devToolsMetadataEvents() {
    return this._devToolsMetadataEvents;
  }

  maximumRecordTime() {
    return this._maximumRecordTime;
  }

  _addEvent(payload) {
    let process = this._processById.get(payload.pid);
    if (!process) {
      process = new Process(this, payload.pid);
      this._processById.set(payload.pid, process);
    }

    const phase = Phase;

    const timestamp = payload.ts / 1000;
    // We do allow records for unrelated threads to arrive out-of-order,
    // so there's a chance we're getting records from the past.
    if (timestamp && (!this._minimumRecordTime || timestamp < this._minimumRecordTime) &&
      (payload.ph === phase.Begin || payload.ph === phase.Complete || payload.ph === phase.Instant))
      this._minimumRecordTime = timestamp;
    const endTimeStamp = (payload.ts + (payload.dur || 0)) / 1000;
    this._maximumRecordTime = Math.max(this._maximumRecordTime, endTimeStamp);
    const event = process._addEvent(payload);
    if (!event)
      return;
    if (payload.ph === phase.Sample) {
      this._addSampleEvent(event);
      return;
    }
    // Build async event when we've got events from all threads & processes, so we can sort them and process in the
    // chronological order. However, also add individual async events to the thread flow (above), so we can easily
    // display them on the same chart as other events, should we choose so.
    if (TracingModel.isAsyncPhase(payload.ph)) {
      this._asyncEvents.push(event);
    }
    if (event.hasCategory(DevToolsMetadataEventCategory))
      this._devToolsMetadataEvents.push(event);

    if (payload.ph !== phase.Metadata)
      return;

    switch (payload.name) {
      case MetadataEvent.ProcessSortIndex:
        process._setSortIndex(payload.args['sort_index']);
        break;
      case MetadataEvent.ProcessName:
        const processName = payload.args['name'];
        process._setName(processName);
        this._processByName.set(processName, process);
        break;
      case MetadataEvent.ThreadSortIndex:
        process.threadById(payload.tid)._setSortIndex(payload.args['sort_index']);
        break;
      case MetadataEvent.ThreadName:
        process.threadById(payload.tid)._setName(payload.args['name']);
        break;
    }
  }

  _addSampleEvent(event: Event) {
    const id = `${event.thread.process().id()}:${event.id}`;
    const group = this._profileGroups.get(id);
    if (group)
      group._addChild(event);
    else
      this._profileGroups.set(id, new ProfileEventsGroup(event));
  }

  tracingComplete() {
    this._processPendingAsyncEvents();
    for (const process of this._processById.values()) {
      for (const thread of process._threads.values()) {
        thread.tracingComplete();
      }
    }
  }

  _processPendingAsyncEvents() {
    this._asyncEvents.sort(Event.compareStartTime);
    for (let i = 0; i < this._asyncEvents.length; ++i) {
      const event = this._asyncEvents[i];
      if (TracingModel.isNestableAsyncPhase(event.phase)) {
        this._addNestableAsyncEvent(event);
      } else {
        this._addAsyncEvent(event);
      }
    }
    this._asyncEvents = [];
    this._closeOpenAsyncEvents();
  }

  _addNestableAsyncEvent(event: Event) {
    const phase = Phase;
    const key = event.categoriesString + '.' + event.id;
    let openEventsStack = this._openNestableAsyncEvents.get(key);

    switch (event.phase) {
      case phase.NestableAsyncBegin:
        if (!openEventsStack) {
          openEventsStack = [];
          this._openNestableAsyncEvents.set(key, openEventsStack);
        }
        const asyncEvent = new AsyncEvent(event);
        openEventsStack.push(asyncEvent);
        event.thread._addAsyncEvent(asyncEvent);
        break;

      case phase.NestableAsyncInstant:
        if (openEventsStack && openEventsStack.length)
          openEventsStack[openEventsStack.length - 1]._addStep(event);
        break;

      case phase.NestableAsyncEnd:
        if (!openEventsStack || !openEventsStack.length)
          break;
        const top = openEventsStack.pop();
        if (top.name !== event.name) {
          console.error(
            `Begin/end event mismatch for nestable async event, ${top.name} vs. ${event.name}, key: ${key}`);
          break;
        }
        top._addStep(event);
    }
  }

  _closeOpenAsyncEvents() {
    for (const event of this._openAsyncEvents.values()) {
      event.setEndTime(this._maximumRecordTime);
      // FIXME: remove this once we figure a better way to convert async console
      // events to sync [waterfall] timeline records.
      event.steps[0].setEndTime(this._maximumRecordTime);
    }
    this._openAsyncEvents.clear();

    for (const eventStack of this._openNestableAsyncEvents.values()) {
      while (eventStack.length)
        eventStack.pop().setEndTime(this._maximumRecordTime);
    }
    this._openNestableAsyncEvents.clear();
  }

  _addAsyncEvent(event: Event) {
    const phase = Phase;
    const key = event.categoriesString + '.' + event.name + '.' + event.id;
    let asyncEvent = this._openAsyncEvents.get(key);

    if (event.phase === phase.AsyncBegin) {
      if (asyncEvent) {
        console.error(`Event ${event.name} has already been started`);
        return;
      }
      asyncEvent = new AsyncEvent(event);
      this._openAsyncEvents.set(key, asyncEvent);
      event.thread._addAsyncEvent(asyncEvent);
      return;
    }
    if (!asyncEvent) {
      // Quietly ignore stray async events, we're probably too late for the start.
      return;
    }
    if (event.phase === phase.AsyncEnd) {
      asyncEvent._addStep(event);
      this._openAsyncEvents.delete(key);
      return;
    }
    if (event.phase === phase.AsyncStepInto || event.phase === phase.AsyncStepPast) {
      const lastStep = asyncEvent.steps[asyncEvent.steps.length - 1];
      if (lastStep.phase !== phase.AsyncBegin && lastStep.phase !== event.phase) {
        console.assert(
          false, 'Async event step phase mismatch: ' + lastStep.phase + ' at ' + lastStep.startTime + ' vs. ' +
          event.phase + ' at ' + event.startTime);
        return;
      }
      asyncEvent._addStep(event);
      return;
    }
    console.assert(false, 'Invalid async event phase');
  }
}

interface LocationOfCode {
  url: string;
  line: number;
  column: number;
  during: number;
}

interface SourceCode {
  filePath: string;
  code: string;
  during: number;
}

export {
  TracingModel,
  LocationOfCode,
  SourceCode
}
