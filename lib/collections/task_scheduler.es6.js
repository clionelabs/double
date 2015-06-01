/*
 * @property {String} requestorId
 * @property {String} responderId
 * @property {String} title
 * @property {String} ruleString Rrule syntax
 * @property {Object[]} instances List of generated task instances.
 * i.e. [{at: timestamp1, taskId: taskId1}, {at: timestamp2, taskId: taskId2}]
 * @property {Timestamp} createdAt
 */

TaskSchedulers = new Meteor.Collection("task_schedulers", {
  transform: (doc) => {
    _.extend(doc, {
      rule: RRule.fromString(doc.ruleString)
    });
    return _.extend(doc, TaskScheduler);
  }
});

TaskSchedulersPermission = {
  insert(userId, doc) {
    return (doc.requestorId === userId || doc.responderId === userId);
  },
  update(userId, doc) {
    return (doc.requestorId === userId || doc.responderId === userId);
  }
};

TaskSchedulers.allow(TaskSchedulersPermission);

TaskSchedulers.create = (options, callback) => {
  if (!options.requestorId) {
    throw Meteor.Error('Invalid requestorId', '');
  }
  if (!options.responderId) {
    throw Meteor.Error('Invalid responderId', '');
  }
  if (!options.ruleString) {
    throw Meteor.Error('Invalid rule', '');
  }
  if (!options.title) {
    throw Meteor.Error('Invalid title', '');
  }

  // set start time to now, if not specified
  let ruleOptions = RRule.parseString(options.ruleString);
  if (!ruleOptions.dtstart) {
    ruleOptions.dtstart = new Date();
  }
  options.ruleString = RRule.optionsToString(ruleOptions);

  let doc = {
    requestorId: null,
    responderId: null,
    ruleString: null,
    title: null,
    instances: [],
    createdAt: moment().valueOf()
  }
  _.extend(doc, options);

  return TaskSchedulers.insert(doc, callback);
}

TaskScheduler = {
  // Return timestamp of the next instance
  nextAt() {
    let result = this.rule.after(new Date(), true);
    return result? moment(result).valueOf(): undefined;
  },

  // Return taskId of the next instance, if already been generated
  nextInstanceId() {
    let nextAt = this.nextAt();
    let instance = _.find(this.instances, function(instance) {
      return instance.at === nextAt;
    });
    return instance? instance.taskId: undefined;
  }
};
