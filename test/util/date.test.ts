import { dateInSecondsSinceEpochIsAfterToday, formatDate } from '../../src/util/date';

describe('date utils tests', () => {
  test('.format() should return date as string', () => {
    const year = 2023;
    const values = [2, 10];
    for (let value of values) {
      const date = new Date(year, value, value, value, value, value);
      const monthStr = (value + 1).toString().padStart(2, '0');
      const valueStr = value.toString().padStart(2, '0');
      expect(formatDate(date)).toEqual(`${year}-${monthStr}-${valueStr} ${valueStr}:${valueStr}:${valueStr}`);
    }
  });

  test('.dateInSecondsSinceEpochIsAfterToday() should validate', () => {
    const now = new Date();
    // expired
    expect(dateInSecondsSinceEpochIsAfterToday((now.getTime() - 100) / 1000)).toBeFalsy();
    // not expired
    expect(dateInSecondsSinceEpochIsAfterToday((now.getTime() + 100) / 1000)).toBeTruthy();
  });
});
