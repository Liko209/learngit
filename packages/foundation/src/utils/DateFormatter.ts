enum DATE_FORMATTER {
  DEFAULT_DATE_FORMAT = 'yyyy-MM-ddThh:mm:ssO',
}

export class DateFormatter {
  private static _addZero(vNumber: number) {
    return (vNumber < 10 ? '0' : '') + vNumber;
  }

  // tslint:disable-next-line
  private static _O(date: Date) {
    // Difference to Greenwich time (GMT) in hours
    const os = Math.abs(date.getTimezoneOffset());
    let h = String(Math.floor(os / 60));
    let m = String(os % 60);
    if (h.length === 1) h = `0${h}`;
    if (m.length === 1) m = `0${m}`;
    return date.getTimezoneOffset() < 0 ? `+${h}${m}` : `-${h}${m}`;
  }

  static formatDate(vDate: Date = new Date(), vFormat: DATE_FORMATTER = DATE_FORMATTER.DEFAULT_DATE_FORMAT) {
    const vDay = DateFormatter._addZero(vDate.getDate());
    const vMonth = DateFormatter._addZero(vDate.getMonth() + 1);
    const vYearLong = DateFormatter._addZero(vDate.getFullYear());
    const vYearShort = DateFormatter._addZero(
      Number(
        vDate
          .getFullYear()
          .toString()
          .substring(3, 4),
      ),
    );
    const vYear = vFormat.indexOf('yyyy') > -1 ? vYearLong : vYearShort;
    const vHour = DateFormatter._addZero(vDate.getHours());
    const vMinute = DateFormatter._addZero(vDate.getMinutes());
    const vSecond = DateFormatter._addZero(vDate.getSeconds());
    const vTimeZone = DateFormatter._O(vDate);
    let vDateString = vFormat
      .replace(/dd/g, vDay)
      .replace(/MM/g, vMonth)
      .replace(/y{1,4}/g, vYear);
    vDateString = vDateString
      .replace(/hh/g, vHour)
      .replace(/mm/g, vMinute)
      .replace(/ss/g, vSecond);
    vDateString = vDateString.replace(/O/g, vTimeZone);
    return vDateString;
  }
}
