function getAvatarColors(type: number) {
  switch (type) {
    case 0:
      return 'tomato';
    case 1:
      return 'blueberry';
    case 2:
      return 'oasis';
    case 3:
      return 'gold';
    case 4:
      return 'sage';
    case 5:
      return 'ash';
    case 6:
      return 'persimmon';
    case 7:
      return 'pear';
    case 8:
      return 'brass';
    case 9:
      return 'lake';
    default:
      return 'tomato';
  }
}
export default getAvatarColors;
