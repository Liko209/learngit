const countToString = (unreadCount?: number) => {
  if (!unreadCount) {
    return '';
  }

  if (unreadCount > 99) {
    return '99+';
  }

  return String(unreadCount);
};

export { countToString };

