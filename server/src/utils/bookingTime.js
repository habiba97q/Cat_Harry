function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timesOverlap(startOne, endOne, startTwo, endTwo) {
  return timeToMinutes(startOne) < timeToMinutes(endTwo)
    && timeToMinutes(endOne) > timeToMinutes(startTwo);
}

module.exports = { timeToMinutes, timesOverlap };
