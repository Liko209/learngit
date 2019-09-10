import React from "react";

import styled, { css } from 'jui/foundation/styled-components';
import { MEETING_STATUS } from "@/store/models/MeetingsUtils";

const MeetingButton = css`
  background-color: #87b763;
  border: 0!important;
  color: #fff;
  font-weight: 600;
  outline: 0;
  padding: 10px 20px;
  box-shadow: none;
  border-radius: 4px;
  text-transform: uppercase;
  cursor: pointer;
`

const MeetingSharedStyle = css`
  font-weight: bold;
  margin-left: 5px;
	font-size: 11px !important;
	padding: 5px 10px;
  :hover {
    text-decoration: none;
  }
`

const MeetingCallback = styled.a`
  ${MeetingSharedStyle}
  ${MeetingButton}
  background:  #42A538 !important;
  :hover {
    background: #5EB256 !important;
  }
`;

const MeetingCancel = styled.a`
  ${MeetingSharedStyle}
  ${MeetingButton}
  background: #c05454 !important;
  :hover {
    background: #9f3e3e !important;
  }
`;

const MeetingJoin = styled.a`
  ${MeetingSharedStyle}
  ${MeetingButton}
`;

const MeetingDuration = styled.p`
  color: "#aaaa";
  font-size: 13px;
  margin-bottom: 0;
  margin: 0 0 5px;
`

const getMeetingStatus = (
  duration: string,
  onStatusClick: (() => void) | undefined,
  isOwner: boolean
) => ({
  [MEETING_STATUS.ENDED]: <MeetingDuration>{duration}</MeetingDuration>,
  [MEETING_STATUS.NO_ANSWER]: !isOwner ? <MeetingCallback onClick={onStatusClick}>Callback</MeetingCallback> : null,
  [MEETING_STATUS.NOT_STARTED]: isOwner ? <MeetingCancel onClick={onStatusClick}>Cancel</MeetingCancel> : null,
  [MEETING_STATUS.LIVE]: <MeetingJoin onClick={onStatusClick}>Join</MeetingJoin>,
});

type Props = {
  status: MEETING_STATUS;
  duration: string;
  onStatusClick?: () => void;
  isOwner: boolean;
};

const MeetingStatus = ({ status, duration, onStatusClick, isOwner }: Props) => (
  <>
    {getMeetingStatus(duration, onStatusClick, isOwner)[status]}
  </>
);

export { MeetingStatus };
