Task = {};

Task.Prototype = {
  isExpired() {
    // TODO
  },
  isCompleted() {
    return !!this.completedAt;
  },
  isWorking(userId) {
    if (this.timesheets && this.timesheets[userId] && this.timesheets[userId].length > 0) {
      let timesheets = this.timesheets[userId];
      return (timesheets[timesheets.length - 1].endedAt === null);
    } else {
      return false;
    }
  },
  totalDuration() {
    return _.reduce(this.timesheets, function(memo, worksByOwnerId, ownerId) {
      return memo +
          _.reduce(worksByOwnerId,
              function(memo2, work) {
                return memo2 + work.duration();
              }, 0);
    }, 0);
  },
  /**
   * Assume the list of statuses is sorted
   * @returns {*|Objects}
   */
  getLatestStatus(userId) {
    let statuses = this.statuses[userId];
    return (statuses && statuses.length > 0) ? statuses[statuses.length - 1] : null;
  },
  /**
   * get statuses created in certain timerange of a certain user
   * @param {number} fromTs
   * @param {number} toTs
   * @returns {*}
   */
  getStatusesWithinTimeRangeOfUser(userId, fromTs, toTs) {
    return _.filter(this.statuses[userId], function(status) {
      return status.createdAt >= fromTs && status.createdAt < toTs;
    });
  },

  /**
   * get statuses created in certain timerange
   * @param fromTs
   * @param toTs
   * @returns {Array}
   */
  getStatusesWithinTimeRange(fromTs, toTs) {
    let task = this;
    return _.reduce(
              _.keys(task.statuses),
              function(memo, userId) {
                memo[userId] = task.getStatusesWithinTimeRangeOfUser(userId, fromTs, toTs);
                return memo;
              }, {});
  },
  getWorks(userId) {
    if (this.timesheets && this.timesheets[userId]) {
      return this.timesheets[userId];
    } else {
      return [];
    }
  },

  getTaggedMessages() {
    return D.Messages.find({taggedTaskIds: {$in: [this._id]}}, {sort: {timestamp: 1} });
  }
};

Task.Timesheet = {};
Task.Timesheet.Prototype = {
  //why not getter? `this` is not the extended object but Task.Timesheet.Prototype
  duration() {
    let work = this;
    return (work.endedAt === null? moment().valueOf(): work.endedAt) - work.startedAt;
  },
  isWithin(from, to) {
    let fromMoment = moment(from);
    let toMoment = moment(to);
    let endedAtMoment = moment(this.endedAt);
    return (fromMoment.isBefore(endedAtMoment) && toMoment.isAfter(endedAtMoment));
  }
};

Task.Step = {};
Task.Step.ProtoType = {
  duration(startedAt = 0, endedAt = moment().valueOf()) {
    let filteredDurations = _.filter(this.durations, function(duration) {
      return duration.createdAt > startedAt && duration.createdAt <= endedAt ;
    });
    return _.reduce(filteredDurations, function(memo, duration) {
      return memo + duration.value;
    }, 0);
  }
};

Task.transform = (doc) => {
  let newDoc = _.extend(doc, Task.Prototype);
  for (let userId in newDoc.timesheets) {
    newDoc.timesheets[userId] = _.map(newDoc.timesheets[userId], function(ts) {
      return _.extend(ts, Task.Timesheet.Prototype);
    });
  }
  newDoc.steps = _.map(newDoc.steps, function(step) {
    return _.extend(step, Task.Step.ProtoType);
  });
  return newDoc;
};

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
  transform: Task.transform
});

Tasks.findRequestedBy = (requestId) => {
  return Tasks.find({ requestorId : requestId });
};

Tasks.findProcessing = () => {
  return Tasks.find({ completedAt : null });
};

Tasks.findRecurring = () => {
  //TODO
  return null;
};

Tasks.findCompleted = () => {
  return Tasks.find({ completedAt : { $not :  null }});
};

TasksPermission = {
  insert(userId, doc) {
    return (doc.requestorId === userId || doc.responderId === userId);
  },
  update() {
    return true;
  }
};

Tasks.allow(TasksPermission);

Tasks.create = (options, callback) => {
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
    statuses: {},
    references: [],
    timesheets: {},
    deadline: null,
    createdAt: moment().valueOf(),
    completedAt: null
  };
  _.extend(doc, options);
  return Tasks.insert(doc, callback);
};

Tasks._popWork = (taskId, userId) => {
  let modifier = {};
  modifier.$pop = {};
  modifier.$pop["timesheets." + userId] = 1;
  Tasks.update(taskId, modifier);
};

Tasks._pushWork = (taskId, userId, startedAt, endedAt) => {
  let newWork = {
    _id: Random.id(),
    startedAt: startedAt,
    endedAt: endedAt
  };
  let modifier = {};
  modifier.$push = {};
  modifier.$push["timesheets." + userId] = newWork;
  Tasks.update(taskId, modifier);
};

Tasks._findLastWork = (taskId, userId) => {
  let doc = Tasks.findOne(taskId, { fields: { timesheets: 1 }});
  if (!doc || !doc.timesheets || !doc.timesheets[userId]) return null;
  return doc.timesheets[userId][doc.timesheets[userId].length-1];
};

Tasks.startWork = (taskId, userId) => {
  let lastWork = Tasks._findLastWork(taskId, userId);
  if (lastWork && lastWork.endedAt === null) {
    throw 'previous work has not ended yet';
  }
  Tasks._pushWork(taskId, userId, moment().valueOf(), null);
};

Tasks.endWork = (taskId, userId) => {
  let lastWork = Tasks._findLastWork(taskId, userId);
  if (!lastWork || lastWork.endedAt !== null) {
    throw 'work has not started yet';
  }
  Tasks._popWork(taskId, userId);
  Tasks._pushWork(taskId, userId, lastWork.startedAt, moment().valueOf());
};

/**
 *
 * @param taskId
 * @param timesheetIdToBeDeleted
 * @param startTime assume before current
 * @param endTime assume before current
 * @returns {any}
 */
Tasks.editWork = (taskId, userId, timesheetIdToBeDeleted, startTime, endTime) => {
  let timesheets = Tasks.findOne(taskId).timesheets[userId];
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

  let modifier = {};
  modifier.$set = {};
  modifier.$set["timesheets." + userId] = removedTimesheetWithId;

  return Tasks.update({ _id : taskId }, modifier);
};

Tasks.complete = (taskId) => {
  Tasks.update({ _id : taskId }, { $set : { completedAt : moment().valueOf() }});
};

Tasks.find({ completedAt : null }).observe({
  changed(newTask, oldTask) {
    if (newTask.lastModified === oldTask.lastModified) {
      Tasks.update({ _id : newTask._id }, { $set : { lastModified : moment().valueOf() }});
    }
  }
});

Tasks.Status = {
  change : (message, taskId, userId, cb) => {
    let createdAt = moment().valueOf();
    let modifier = {};
    modifier.$push = {};
    modifier.$push['statuses.' + userId] = { message : message, createdAt : createdAt };
    return Tasks.update({ _id : taskId }, modifier, cb);
  }
};

Tasks.References = {
  add : (title, url, taskId, cb) => {
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
  delete : (taskId, refId, cb) => {
    return Tasks.update(
      { _id : taskId },
      { $pull : { references : { _id : refId }}}
    , cb);
  }
};

Tasks.Description = {
  edit : (description, taskId, cb) => {
    return Tasks.update(
        { _id : taskId },
        {
          $set : { description : description }
        }
    , cb);
  }
};

Tasks.Steps = {
  add : (itemText, taskId, cb = null) => {
    let step = {
      _id : Random.id(),
      text : itemText,
      isCompleted : false,
      createdAt : moment().valueOf()
    };
    Tasks.update({ _id : taskId }, { $push : { steps: step }}, cb);
    return step._id;
  },
  toggleComplete : (taskId, stepId, cb = null) => {
    let task = Tasks.findOne({ _id : taskId });
    let steps = _.map(task.steps, (step)=> {
      if (step._id === stepId) {
        step.isCompleted = !step.isCompleted;
      }
      return step;
    });
    Tasks.update({ _id : taskId }, { $set : { steps : steps }}, cb);
  },
  delete : (taskId, stepId, cb = null) => {
    let task = Tasks.findOne({ _id : taskId });
    let steps = _.filter(task.steps, (step)=> {
      return step._id !== stepId;
    });

    Tasks.update({ _id : taskId }, { $set : { steps : steps }}, cb);
  },
  bankTime : (taskId, updates, cb) => {
    let task = Tasks.findOne({ _id : taskId });
    let currentTime = moment().valueOf();
    let steps = _.map(task.steps, function(step) {
      let index = _.reduce(updates, function(memo, update, index) {
        if (update.stepId === step._id) {
          return index;
        } else {
          return memo;
        }
      }, -1);

      if (index === -1) throw new Meteor.Error("can't update, stepId not found");

      step.durations = step.durations || [];
      step.durations.push({
        value : updates[index].timeToBeAdded,
        createdAt : currentTime,
        _id: Random.id()
      });
      return step;
    });

    Tasks.update({ _id : taskId }, { $set : { steps : steps }}, cb);
  }
};
