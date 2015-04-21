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
Tasks = new Meteor.Collection("tasks",
  {
    transform : function(doc) {
      return _.extend(doc, Task.Prototype);
    }
  }
);

Tasks.allow({
  insert: function(userId, doc) {
    return (doc.requestorId === userId || doc.responderId === userId);
  },
  update: function(userId, doc) {
    // TODO: finer control? avoid client from removing timesheets maybe? =O
    return (doc.requestorId === userId || doc.responderId === userId);
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
};

Task = {};

Tasks.Status = {
  change : function(message, taskId = this._id, cb) {
    let createdAt = moment().valueOf();
    return Tasks.update(
        { _id : taskId },
        {
          $push : {
            statuses : { message : message, createdAt : createdAt }
          }
        }
    , cb);
  }
};


Task.Prototype = {
  isExpired: function() {
    // TODO
  },
  isCompleted: function() {
    // TODO
  },
  getTotalDuration: function() {
    // TODO
  },
  /**
   * Assume the list of statuses is sorted
   * @returns {*|Object}
   */
  getLatestStatus : function() {
    let task = this;
    return task.statuses[task.statuses.length - 1];
  }
};
