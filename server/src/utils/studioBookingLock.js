const { randomUUID } = require('crypto');
const Studio = require('../models/Studio');

const LOCK_TTL_MS = 120_000;
const LOCK_ATTEMPTS = 30;
const RETRY_DELAY_MS = 100;

const pause = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function acquireStudioBookingLock(studioId) {
  const token = randomUUID();

  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt += 1) {
    const now = new Date();
    const studio = await Studio.findOneAndUpdate(
      {
        _id: studioId,
        $or: [
          { bookingLockExpiresAt: { $exists: false } },
          { bookingLockExpiresAt: null },
          { bookingLockExpiresAt: { $lt: now } },
        ],
      },
      {
        $set: {
          bookingLockToken: token,
          bookingLockExpiresAt: new Date(now.getTime() + LOCK_TTL_MS),
        },
      },
      { new: true, select: '_id' }
    );

    if (studio) {
      return async () => {
        await Studio.updateOne(
          { _id: studioId, bookingLockToken: token },
          { $unset: { bookingLockToken: 1, bookingLockExpiresAt: 1 } }
        );
      };
    }

    await pause(RETRY_DELAY_MS);
  }

  const studioExists = await Studio.exists({ _id: studioId });
  const error = new Error(studioExists
    ? 'This studio is processing another booking. Please try again.'
    : 'Studio not found');
  error.statusCode = studioExists ? 409 : 404;
  throw error;
}

module.exports = { acquireStudioBookingLock };
