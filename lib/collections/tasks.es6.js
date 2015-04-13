/**
 * @property {String} requestorId
 * @property {String} responderId
 * @property {String} title
 * @property {Object[]} statuses
 * @property {Object[]} references
 * @property {Object[]} timesheets
 * @property {Timestamp} deadline
 * @property {Timestamp} createdAt
 * @property {Timestmap} completedAt
 *
 */
Tasks = new Meteor.Collection("tasks", function(doc) {
  return _.extend(doc, TaskPrototype);
});

Tasks.allow({
  insert: function(userId, doc) {
    if (doc.requestorId === userId || doc.responderId === userId) return true;
    return false;
  },
  update: function(userId, doc) {
    // TODO: finer control? avoid client from removing timesheets maybe? =O
    if (doc.requestorId === userId || doc.responderId === userId) return true;
    return false;
  }
});

Tasks.create = function(options, callback) {
  var doc = {
    requestorId: null,
    responderId: null,
    title: title,
    statuses: [],
    references: [],
    timesheets: [],
    deadline: null,
    createdAt: moment().valueOf(),
    completedAt: null
  }
  _.extend(doc, options);
  return Tasks.insert(doc, callback);
}

TaskPrototype = {
  isExpired: function() {
    // TODO
  },
  isCompleted: function() {
    // TODO
  },
  getTotalDuration: function() {
    // TODO
  },
  getLatestStatus: function() {
    // TODO
  }
}
