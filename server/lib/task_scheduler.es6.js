// Loop through all the existing task schedulers and generate their next task instances (if not already been generated)
TaskSchedulers.generateAllNextsIfNotExisted = function() {
  TaskSchedulers.find().forEach(function(scheduler) {
    TaskSchedulers.generateNextIfNotExisted(scheduler._id);
  });
}

TaskSchedulers.generateNextIfNotExisted = function(taskSchedulerId) {
  let scheduler = TaskSchedulers.findOne(taskSchedulerId);
  if (scheduler.nextAt() === undefined) return; // no next

  let nextInstanceId = scheduler.nextInstanceId();
  if (!nextInstanceId) {
    let doc = {
      requestorId: scheduler.requestorId,
      responderId: scheduler.responderId,
      title: scheduler.title,
      schedulerId: scheduler._id
    }
    let taskId = Tasks.create(doc);
    TaskSchedulers.update(scheduler._id, {$push: {instances: {at: scheduler.nextAt(), taskId: taskId}}});
  }
}

TaskSchedulers.handleAdded = function(doc) {
  TaskSchedulers.generateNextIfNotExisted(doc._id);
}

TaskSchedulers.startup = function() {
  TaskSchedulers.generateAllNextsIfNotExisted();
  TaskSchedulers.find({}, {sort: {createdAt: -1}, limit: 1}).observe({
    added: function(doc) {
      TaskSchedulers.handleAdded(doc);
    }
  });
}
