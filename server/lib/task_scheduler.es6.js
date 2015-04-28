TaskSchedulers.create = function(options) {
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

  let doc = {
    requestorId: null,
    responderId: null,
    ruleString: null,
    title: null,
    instances: [],
    createdAt: moment().valueOf()
  }
  _.extend(doc, options);

  var schedulerId = TaskSchedulers.insert(doc);

  // generate the next task instance immediately
  var scheduler = TaskSchedulers.findOne(schedulerId);
  scheduler.generateNextIfNotExisted();

  return schedulerId;
}

// Loop through all the existing task schedulers and generate their next task instances (if not already been generated)
TaskSchedulers.generateNexts = function() {
  TaskSchedulers.find().forEach(function(scheduler) {
    scheduler.generateNextIfNotExisted();
  });
}

_.extend(TaskScheduler, {
  // Generate the next task instance if not already been generated
  generateNextIfNotExisted: function() {
    if (this.nextAt() === null) return; // no next

    let nextInstanceId = this.nextInstanceId();
    if (!nextInstanceId) {
      var doc = {
        requestorId: this.requestorId,
        responderId: this.responderId,
        title: this.title,
        schedulerId: this._id
      }
      var taskId = Tasks.create(doc);
      TaskSchedulers.update(this._id, {$push: {instances: {at: this.nextAt(), taskId: taskId}}});
    }
  }
});
