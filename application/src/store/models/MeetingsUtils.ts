enum MEETING_STATUS {
  NOT_STARTED,
  CANCELLED,
  FAILED,
  LIVE,
  EXPIRED,
  ENDED,
  NO_ANSWER,
  UN_KNOWN,
}

const MEETING_STATUS_MAP = {
  not_started: MEETING_STATUS.NOT_STARTED,
  cancelled: MEETING_STATUS.CANCELLED,
  failed: MEETING_STATUS.FAILED,
  live: MEETING_STATUS.LIVE,
  expired: MEETING_STATUS.EXPIRED,
  ended: MEETING_STATUS.ENDED,
  no_answer: MEETING_STATUS.NO_ANSWER,
};

const ONE_HOUR = 3600000;

function getMeetingStatus(status: string, createdAt: number) {
  const currentTime = new Date().getTime();
  if (status === 'not_started' && currentTime - createdAt > ONE_HOUR) {
    return MEETING_STATUS.CANCELLED;
  }
  if (Object.prototype.hasOwnProperty.call(MEETING_STATUS_MAP, status)) {
    return MEETING_STATUS_MAP[status];
  }
  return MEETING_STATUS.UN_KNOWN;
}

export { MEETING_STATUS, MEETING_STATUS_MAP, getMeetingStatus };
