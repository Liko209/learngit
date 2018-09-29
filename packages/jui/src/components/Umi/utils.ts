const countToString = (unreadCount?: number) => {
  if (!unreadCount) {
    return '';
  }

  if (unreadCount > 99) {
    return '99+';
  }

  return String(unreadCount);
};

const countToWidth = (unreadCount?: number) => {
  const length = String(unreadCount).length;
  switch (length) {
    case 1:
      return 4;
    case 2:
      return 5;
    default:
      return 7;
  }
};

export { countToString, countToWidth };
