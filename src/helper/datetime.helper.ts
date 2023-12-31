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
    const now = initialDate ? new Date(initialDate) : new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    return new Date(
      year + adjustYear,
      month + adjustMonth,
      day + adjustDay,
    ).toISOString();
  }

  static UTCToLocaleDate(date: string, format = 'intl') {
    const newDate = new Date(date);
    const getYear = newDate.toLocaleDateString('en', {
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
    const getMonth = newDate.toLocaleDateString('en', {
      month: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
    const getDate = newDate.toLocaleDateString('en', {
      day: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
    let reformat = '';
    if (format == 'local') {
      reformat = `${getDate}-${getMonth}-${getYear}`;
    } else {
      reformat = `${getYear}-${getMonth}-${getDate}`;
    }
    return reformat;
  }

  static LocalMonth(monthNumber: number) {
    const MonthList = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return MonthList[monthNumber - 1];
  }
}
