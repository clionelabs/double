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
  if (!options.requestorId) {
    throw "Invalid requestorId";
  }
  if (!options.responderId) {
    throw "Invalid responderId";
  }
  if (!options.title) {
    throw "Invalid title";
  }

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

Tasks.complete = function(taskId) {
  Tasks.update({ _id : taskId }, { $set : { completedAt : moment().valueOf() }});
};

Task = {};

Tasks.Status = {
  change : function(message, taskId, cb) {
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
    return !!this.completedAt;
  },
  isWorking: function() {
    return (this.timesheets.length !== 0 && this.timesheets[this.timesheets.length-1].endedAt === null);
  },
  getCurrentSectionDuration: function() {
    let work = this.timesheets[this.timesheets.length - 1];
    return moment().valueOf() - work.startedAt;
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
  getLatestStatus : function() {
    let task = this;
    return task.statuses[task.statuses.length - 1];
  }
};
