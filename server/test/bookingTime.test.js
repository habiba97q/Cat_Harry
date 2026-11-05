const test = require('node:test');
const assert = require('node:assert/strict');
const { timesOverlap, timeToMinutes } = require('../src/utils/bookingTime');

test('converts a 24-hour time to minutes since midnight', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('13:45'), 825);
  assert.equal(timeToMinutes('23:59'), 1439);
});

test('detects partial, full, and identical time overlaps', () => {
  assert.equal(timesOverlap('09:00', '11:00', '10:00', '12:00'), true);
  assert.equal(timesOverlap('09:00', '12:00', '10:00', '11:00'), true);
  assert.equal(timesOverlap('10:00', '11:00', '10:00', '11:00'), true);
});

test('allows back-to-back bookings without treating their boundary as overlap', () => {
  assert.equal(timesOverlap('09:00', '10:00', '10:00', '11:00'), false);
  assert.equal(timesOverlap('10:00', '11:00', '09:00', '10:00'), false);
});
