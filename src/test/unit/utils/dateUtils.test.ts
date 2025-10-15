import * as assert from 'assert';
import { getCurrentTimestamp } from '../../../utils/dateUtils';

suite('Date Utils Test Suite', () => {
  test('should generate ISO 8601 timestamp', () => {
    const timestamp = getCurrentTimestamp();
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    assert.match(timestamp, isoRegex);
  });

  test('should generate valid date', () => {
    const timestamp = getCurrentTimestamp();
    const date = new Date(timestamp);
    assert.ok(!isNaN(date.getTime()));
  });

  test('should generate different timestamps when called multiple times', (done) => {
    const timestamp1 = getCurrentTimestamp();
    setTimeout(() => {
      const timestamp2 = getCurrentTimestamp();
      assert.notStrictEqual(timestamp1, timestamp2);
      done();
    }, 10);
  });
});
