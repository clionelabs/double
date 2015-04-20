TaskSchedulers = new Meteor.Collection("taskScheduler", function(doc) {
  doc.recur = moment().recur
  return _.extend(doc, TaskScheduler);
});

TaskScheduler = {
  toString() {
  }
};
