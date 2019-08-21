export function updateShowJumpToLatestButton({
  isAboveScrollToLatestCheckPoint,
  hasMoreDown,
  isAtBottom,
  buttonShowed,
}: {
  isAboveScrollToLatestCheckPoint: boolean;
  hasMoreDown: boolean;
  isAtBottom: boolean | null;
  buttonShowed: boolean;
}) {
  if (isAtBottom === null) return null;

  if (isAtBottom && isAboveScrollToLatestCheckPoint) {
    return null;
  }

  if (buttonShowed && isAtBottom && !hasMoreDown) {
    return false;
  }

  if (!buttonShowed && (isAboveScrollToLatestCheckPoint || hasMoreDown)) {
    return true;
  }
  return null;
}
