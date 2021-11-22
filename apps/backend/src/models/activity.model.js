const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const activitySchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    preview: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
activitySchema.plugin(toJSON);
activitySchema.plugin(paginate);

/**
 * Check if activity already created
 * @param {ObjectId} userId
 * @returns {Promise<boolean>}
 */
activitySchema.statics.alreadyCreated = async function (...userIds) {
  const users = [...new Set(userIds)];
  const activity = await this.findOne({ $and: [{ users: { $all: users } }, { users: { $size: users.length } }] });
  return !!activity;
};

/**
 * @typedef Activity
 */
const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
