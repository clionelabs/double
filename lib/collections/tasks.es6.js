/**
 * @property {String} requestorId
 * @property {String} responderId
 * @property {String} schedulerId Null if not generated from scheduler
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
    let newDoc = _.extend(doc, Task.Prototype);
    newDoc.timesheets = _.map(newDoc.timesheets, (ts) => {
      return _.extend(ts, Tasks.Timesheet.Prototype);
    });
    return newDoc;
  }
});

Tasks.findProcessing = function() {
  return Tasks.find({ completedAt : null });
};

Tasks.findRecurring = function() {
  //TODO
  return null;
};

Tasks.findCompleted = function() {
  return Tasks.find({ completedAt : { $not :  null }});
};

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
    schedulerId: null,
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
    _id : Random.id(),
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

/**
 *
 * @param taskId
 * @param timesheetIdToBeDeleted
 * @param startTime assume before current
 * @param endTime assume before current
 * @returns {any}
 */
Tasks.editWork = function(taskId, timesheetIdToBeDeleted, startTime, endTime) {
  let timesheets = Tasks.findOne(taskId).timesheets;
  if (!timesheets || !timesheets.length) throw "timesheet is empty";
  let removedTimesheetWithId = _.reject(timesheets, (timesheet) => {
      return _.isEqual(timesheet._id, timesheetIdToBeDeleted);
    });
  if (_.isEqual(timesheets, removedTimesheetWithId)) throw "timesheet not found";

  let newTimeSheet = {
      _id : Random.id(),
      startedAt : startTime,
      endedAt : endTime
  };
  let whereToInsert = _.sortedIndex(removedTimesheetWithId, newTimeSheet, 'startedAt');

  removedTimesheetWithId.splice(whereToInsert, 0, newTimeSheet);

  return Tasks.update({ _id : taskId }, { $set : { timesheets : removedTimesheetWithId }});
};

Tasks.complete = function(taskId) {
  Tasks.update({ _id : taskId }, { $set : { completedAt : moment().valueOf() }});
};

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

Tasks.References = {
  add : function(title, url, taskId, cb) {
    let createdAt = moment().valueOf();
    return Tasks.update(
      { _id : taskId },
      {
        $push : {
          references : { _id : Random.id(), title : title, url : url, createdAt : createdAt }
        }
      }
    , cb);
  },
  delete : function(taskId, refId, cb) {
    return Tasks.update(
      { _id : taskId },
      { $pull : { references : { _id : refId }}}
    , cb);
  }
};

Task = {};

Task.Prototype = {
  isExpired() {
    // TODO
  },
  isCompleted() {
    return !!this.completedAt;
  },
  isWorking() {
    return (this.timesheets.length !== 0 && this.timesheets[this.timesheets.length-1].endedAt === null);
  },
  totalDuration() {
    return _.reduce(this.timesheets, function(memo, work) {
      return memo + work.duration();
    }, 0);
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

Tasks.Timesheet = {};
Tasks.Timesheet.Prototype = {
  duration() {//getter `this` is not the extended object but Tasks.Timesheet.Prototype
    let work = this;
    return (work.endedAt === null? moment().valueOf(): work.endedAt) - work.startedAt;
  }
};
