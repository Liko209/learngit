import { DATE_FORMATTER } from '../constants';

class DateFormatter {
  formatDate(vDate: Date, vFormat: DATE_FORMATTER) {
    const vDay = this.addZero(vDate.getDate());
    const vMonth = this.addZero(vDate.getMonth() + 1);
    const vYearLong = this.addZero(vDate.getFullYear());
    const vYearShort = this.addZero(
      Number(
        vDate
          .getFullYear()
          .toString()
          .substring(3, 4),
      ),
    );
    const vYear = vFormat.indexOf('yyyy') > -1 ? vYearLong : vYearShort;
    const vHour = this.addZero(vDate.getHours());
    const vMinute = this.addZero(vDate.getMinutes());
    const vSecond = this.addZero(vDate.getSeconds());
    const vTimeZone = this.O(vDate);
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

  addZero(vNumber: number) {
    return (vNumber < 10 ? '0' : '') + vNumber;
  }

  // tslint:disable-next-line
  O(date: Date) {
    // Difference to Greenwich time (GMT) in hours
    const os = Math.abs(date.getTimezoneOffset());
    let h = String(Math.floor(os / 60));
    let m = String(os % 60);
    if (h.length === 1) h = `0${h}`;
    if (m.length === 1) m = `0${m}`;
    return date.getTimezoneOffset() < 0 ? `+${h}${m}` : `-${h}${m}`;
  }
}

export default DateFormatter;
