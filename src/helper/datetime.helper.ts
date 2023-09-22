import { Injectable } from '@nestjs/common';

@Injectable()
export class DatetimeHelper {
  static CurrentDateTime(type = 'UTC') {
    let date = '';
    switch (type) {
      case 'ISO':
        date = new Date().toISOString(); // return 2019-11-14T00:55:31.820Z
        break;
      default:
        date = new Date().toUTCString(); // return Thu, 14 Nov 2019 00:55:16 GMT
        break;
    }
    return date;
  }

  static setExpiredTime(
    adjustYear,
    adjustMonth = 0,
    adjustDay = 0,
    initialDate = '',
  ) {
    const now = new Date(initialDate);
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    return new Date(
      year + adjustYear,
      month + adjustMonth,
      day + adjustDay,
    ).toISOString();
  }
}
