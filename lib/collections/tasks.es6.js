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
  return _.extend(doc, Task.Prototype);
});

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
  getLatestStatus: function() {
    return this.statuses[this.statuses.length - 1];
  }
};

Task.Format = {
  statusToMessage : function(status) {
    let obj = status || this;
    if (!(obj.message || obj.createdAt)) throw "status is malformed";
    return {
      type: "comment",
      message: obj.message + " " + moment.humanize(moment(obj.createdAt))
    };
  },
  referenceToMessage : function(ref) {
    let obj = ref || this;
    if (!(obj.title || obj.url)) throw "status is malformed";
    return {
      type : "link",
      message: obj.title,
      url : obj.url
    }
  },
  deadlineToMessage : function(deadline) {
    let obj = moment(deadline) || moment(this);
    if (!(deadline.isValid())) throw "deadline is not valid";
    return {
      type: "time",
      message: obj.format("MMM DD, YYYY")
    };
  },
  taskSchedulerToMessage : function(taskScheduler) {
    let obj = taskScheduler || this;
    if (!obj.toString) throw "taskScheduler is not valid";
    return {
      type: "refresh",
      message: obj.toString()
    }
  }
};
