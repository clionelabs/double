Task = {};

Task.Prototype = {
  isExpired() {
    // TODO
  },
  isCompleted() {
    return !!this.completedAt;
  },
  totalDuration(from = 0, to = moment().valueOf() + 1) {
    return _.reduce(this.steps, function(memo, step) {
      return memo + step.duration(from, to);
    }, 0);
  },
  totalDurationInMinutes(from = 0, to = moment().valueOf() + 1) {
    return moment.duration(this.totalDuration(from, to)).asMinutes();
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
  },
  oneTimePurchasesInRange(fromTs, toTs) {
    return _.filter(this.oneTimePurchases,
        function(oneTimePurchase) {
          return oneTimePurchase.date >= fromTs && oneTimePurchase.date < toTs;
        });
  },
  adjustmentsInRange(fromTs, toTs) {
    return _.filter(this.adjustments,
        function(adjustment) {
          return adjustment.createdAt >= fromTs && adjustment.createdAt < toTs;
        });
  },

  colorCodes() {
    let hash = this._id.hashCode();
    let r = (hash & 0xFF0000) >> 16;
    let g = (hash & 0x00FF00) >> 8;
    let b = hash & 0x0000FF;
    return [r, g, b];
  },

  backgroundColor() {
    let [r, g, b] = this.colorCodes();
    let r16 = ("0" + r.toString(16)).substr(-2);
    let g16 = ("0" + g.toString(16)).substr(-2);
    let b16 = ("0" + b.toString(16)).substr(-2);
    return `#${r16}${g16}${b16}`;
  },

  foregroundColor() {
    let [r, g, b] = this.colorCodes();
    // Ref: http://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
    let alpha = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return alpha < 0.5? "#ffffff": "#000000";
  },

  oneTimePurchase(oneTimePurchaseId) {
    return _.first(_.filter(this.oneTimePurchases, function(otp) { return otp._id === oneTimePurchaseId; }));
  }
};

Task.Step = {};
Task.Step.ProtoType = {
  duration(startedAt = 0, endedAt = moment().valueOf() + 1) {
    let filteredDurations = _.filter(this.durations, function(duration) {
      return duration.date >= startedAt && duration.date < endedAt;
    });
    return _.reduce(filteredDurations, function(memo, duration) {
      return memo + duration.value;
    }, 0);
  }
};

Task.transform = (doc) => {
  let newDoc = _.extend(doc, Task.Prototype);

  newDoc.steps = _.map(newDoc.steps, function(step) {
    return _.extend(step, Task.Step.ProtoType);
  });
  _.each(newDoc.oneTimePurchases, function(otp) {
    _.extend(otp, Tasks.OneTimePurchase.ProtoType);
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

Tasks.complete = (taskId) => {
  return Tasks.update({ _id : taskId }, { $set : { completedAt : moment().valueOf() }});
};

Tasks.editTitle = (taskId, newTitle, cb) => {
  return Tasks.update({ _id : taskId }, { $set : { title : newTitle }}, cb);
};

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
  add: (itemText, taskId, cb = null) => {
    let step = {
      _id: Random.id(),
      text: itemText,
      isCompleted: false,
      createdAt: moment().valueOf()
    };
    Tasks.update({_id: taskId}, {$push: {steps: step}}, cb);
    return step._id;
  },
  toggleComplete: (taskId, stepId, cb = null) => {
    let task = Tasks.findOne({_id: taskId});
    let steps = _.map(task.steps, (step)=> {
      if (step._id === stepId) {
        step.isCompleted = !step.isCompleted;
      }
      return step;
    });
    return Tasks.update({_id: taskId}, {$set: {steps: steps}}, cb);
  },
  delete: (taskId, stepId, cb = null) => {
    let task = Tasks.findOne({_id: taskId});
    let steps = _.filter(task.steps, (step)=> {
      return step._id !== stepId;
    });

    return Tasks.update({_id: taskId}, {$set: {steps: steps}}, cb);
  },
  bankTime: (assistantId, taskId, updates, cb) => {
    let task = Tasks.findOne({_id: taskId});
    let currentTime = moment().valueOf();
    let currentDate = moment().valueOf();
    let steps = _.map(task.steps, function (step) {
      let index = _.reduce(updates, function (memo, update, index) {
        if (update.stepId === step._id) {
          return index;
        } else {
          return memo;
        }
      }, -1);

      if (index === -1) return step;

      step.durations = step.durations || [];
      step.durations.push({
        assistantId : assistantId,
        value: updates[index].timeToBeAdded,
        date: currentDate,
        createdAt: currentTime,
        _id: Random.id()
      });
      return step;
    });

    return Tasks.update({ _id: taskId }, { $set: { steps: steps }}, cb);
  },
  editTitle: (taskId, stepId, newTitle, cb) => {
    let task = Tasks.findOne({_id: taskId});
    let steps = _.map(task.steps, function (step) {
      if (stepId === step._id) {
        step.text = newTitle;
      }
      return step;
    });
    return Tasks.update({_id: taskId}, {$set: {steps: steps}}, cb);
  }
};
Tasks.Steps.Durations = {
  edit : (taskId, stepId, durationId, date, value, cb) => {
    let task = Tasks.findOne({ _id : taskId });
    _.each(task.steps, function(step) {
      if (step._id === stepId) {
        _.each(step.durations, function (duration) {
          if (durationId === duration._id) {
            duration.date = date;
            duration.value = value;
          }
        });
      }
    });
    return Tasks.update({ _id : taskId }, { $set : { steps : task.steps }}, cb);
  },
  delete : (taskId, stepId, durationId, cb) => {
    let task = Tasks.findOne({ _id : taskId });
    _.each(task.steps, function(step) {
      if (step._id === stepId) {
        step.durations = _.filter(step.durations, function (duration) {
          return durationId !== duration._id;
        });
      }
    });
    return Tasks.update({ _id : taskId }, { $set : { steps : task.steps }}, cb);
  }
};

Tasks.Tags = {
  add: (tag, taskId, cb) => {
    return Tasks.update({ _id : taskId }, { $push : { tags : tag }}, cb);
  },
  delete: (tag, taskId, cb) => {
    return Tasks.update({ _id : taskId }, { $pull : { tags : tag }}, cb);
  }
};
