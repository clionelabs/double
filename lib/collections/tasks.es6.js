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
Tasks = new Meteor.Collection("tasks", {
  transform: function(doc) {
    return _.extend(doc, Task.Prototype)
  }
});

TasksPermission = {
  insert: function(userId, doc) {
    return (doc.requestorId === userId || doc.responderId === userId);
  },
  update: function(userId, doc) {
    // TODO: finer control? avoid client from removing timesheets maybe? =O
    return (doc.requestorId === userId || doc.responderId === userId);
  }
}

Tasks.allow(TasksPermission);

Tasks.create = function(options, callback) {
  let doc = {
    requestorId: null,
    responderId: null,
    title: null,
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

Tasks.startWork = function(taskId) {
  let lastWork = this._findLastWork(taskId);
  if (lastWork && lastWork.endedAt === null) {
    throw 'previous work has not ended yet';
  }
  Tasks._pushWork(taskId, moment().valueOf(), null);
}

Tasks.endWork = function(taskId) {
  let lastWork = this._findLastWork(taskId);
  if (!lastWork || lastWork.endedAt !== null) {
    throw 'work has not started yet';
  }
  Tasks._popWork(taskId);
  Tasks._pushWork(taskId, lastWork.startedAt, moment().valueOf());
}

Tasks._popWork = function(taskId) {
  Tasks.update(taskId, {$pop: {timesheets: 1}});
}

Tasks._pushWork = function(taskId, startedAt, endedAt) {
  let newWork = {
    startedAt: startedAt,
    endedAt: endedAt
  }
  Tasks.update(taskId, {$push: {timesheets: newWork}});
};

Tasks._findLastWork = function(taskId) {
  let doc = Tasks.findOne(taskId, {fields: {timesheets: 1}});
  if (!doc || !doc.timesheets) return null;
  return doc.timesheets[doc.timesheets.length-1];
};

Task = {};

Task.Prototype = {
  isExpired: function() {
    // TODO
  },
  isCompleted: function() {
    // TODO
  },
  isWorking: function() {
    return (this.timesheets.length !== 0 && this.timesheets[this.timesheets.length-1].endedAt === null);
  },
  getTotalDuration: function() {
    let sum = _.reduce(this.timesheets, function(memo, work) {
      let duration = (work.endedAt === null? moment().valueOf(): work.endedAt) - work.startedAt;
      return memo + duration;
    }, 0);
    return sum;
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
