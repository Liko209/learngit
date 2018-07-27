import { DATE_FORMATTER } from './constants';

class DateFormatter {
  formatDate(vDate: Date, vFormat: DATE_FORMATTER) {
    let vDay = this.addZero(vDate.getDate());
    let vMonth = this.addZero(vDate.getMonth() + 1);
    let vYearLong = this.addZero(vDate.getFullYear());
    let vYearShort = this.addZero(
      Number(vDate
        .getFullYear()
        .toString()
        .substring(3, 4))
    );
    let vYear = vFormat.indexOf('yyyy') > -1 ? vYearLong : vYearShort;
    let vHour = this.addZero(vDate.getHours());
    let vMinute = this.addZero(vDate.getMinutes());
    let vSecond = this.addZero(vDate.getSeconds());
    let vTimeZone = this.O(vDate);
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

  formatUTCDate(vDate: Date, vFormat: DATE_FORMATTER) {
    let vDay = this.addZero(vDate.getUTCDate());
    let vMonth = this.addZero(vDate.getUTCMonth() + 1);
    let vYearLong = this.addZero(vDate.getUTCFullYear());
    let vYearShort = this.addZero(
      Number(
        vDate
          .getUTCFullYear()
          .toString()
          .substring(3, 4)
      )
    );
    let vYear = vFormat.indexOf('yyyy') > -1 ? vYearLong : vYearShort;
    let vHour = this.addZero(vDate.getUTCHours());
    let vMinute = this.addZero(vDate.getUTCMinutes());
    let vSecond = this.addZero(vDate.getUTCSeconds());
    let vDateString = vFormat
      .replace(/dd/g, vDay)
      .replace(/MM/g, vMonth)
      .replace(/y{1,4}/g, vYear);
    vDateString = vDateString
      .replace(/hh/g, vHour)
      .replace(/mm/g, vMinute)
      .replace(/ss/g, vSecond);
    return vDateString;
  }

  addZero(vNumber: number) {
    return (vNumber < 10 ? '0' : '') + vNumber;
  }

  O(date: Date) {
    // Difference to Greenwich time (GMT) in hours
    const os = Math.abs(date.getTimezoneOffset());
    let h = String(Math.floor(os / 60));
    let m = String(os % 60);
    if (h.length === 1) h = '0' + h;
    if (m.length === 1) m = '0' + m;
    return date.getTimezoneOffset() < 0 ? '+' + h + m : '-' + h + m;
  }
}

export default DateFormatter;
