/*
 * @property {String} requestorId
 * @property {String} responderId
 * @property {String} title
 * @property {String} criteria Cron syntax
 * @property {Timestamp} createdAt
 */

TaskSchedulers = new Meteor.Collection("task_schedulers", {
  transform: function(doc) {
    return _.extend(doc, TaskScheduler);
  }
});

TaskSchedulersPermission = {
  insert: function(userId, doc) {
    return (doc.requestorId === userId || doc.responderId === userId);
  },
  update: function(userId, doc) {
    return (doc.requestorId === userId || doc.responderId === userId);
  }
}

TaskSchedulers.allow(TaskSchedulersPermission);

TaskSchedulers.create = function(options, callback) {
  if (!options.requestorId) {
    throw "Invalid requestorId";
  }
  if (!options.responderId) {
    throw "Invalid responderId";
  }
  if (!options.criteria) {
    throw "Invalid criteria";
  }
  if (!options.title) {
    throw "Invalid title";
  }

  let doc = {
    requestorId: null,
    responderId: null,
    criteria: null,
    title: null,
    createdAt: moment().valueOf()
  }
  _.extend(doc, options);

  console.log("cri: ", doc.criteria, later);
  console.log('criteria: ', doc.criteria, later.parse.cron(doc.criteria));

  // return TaskSchedulers.insert(doc, callback);
}

TaskScheduler = {
}
