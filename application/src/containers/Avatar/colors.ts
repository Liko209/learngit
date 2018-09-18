function getAvatarColors(type: number) {
  switch (type) {
    case 0:
      return '#F95B5C';
    case 1:
      return '#6E6EC0';
    case 2:
      return '#5E95C8';
    case 3:
      return '#FFBF2A';
    case 4:
      return '#7EB57F';
    case 5:
      return '#666666';
    case 6:
      return '#FF8800';
    case 7:
      return '#5FB95C';
    case 8:
      return '#CC9922';
    case 9:
      return '#6FAFEB';
    default:
      return '#5E95C8';
  }
}
export default getAvatarColors;
