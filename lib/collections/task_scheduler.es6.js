/*
 * @property {String} requestorId
 * @property {String} responderId
 * @property {String} title
 * @property {String} ruleString Rrule syntax
 * @property {Object[]} instances List of generated task instances. i.e. [{at: timestamp1, taskId: taskId1}, {at: timestamp2, taskId: taskId2}]
 * @property {Timestamp} createdAt
 */

TaskSchedulers = new Meteor.Collection("task_schedulers", {
  transform: function(doc) {
    _.extend(doc, {
      rule: RRule.fromString(doc.ruleString)
    });
    return _.extend(doc, TaskScheduler);
  }
});

TaskScheduler = {
  // Return timestamp of the next instance
  nextAt: function() {
    let result = this.rule.after(new Date(), true);
    if (result) {
      return moment(result).valueOf();
    }
    return null;
  },

  // Return taskId of the next instance, if already been generated
  nextInstanceId: function() {
    let nextAt = this.nextAt();
    for (let i = 0; i < this.instances.length; i++) {
      if (this.instances[i].at === nextAt) {
        return this.instances[i].taskId;
      }
    }
    return null;
  }
}
