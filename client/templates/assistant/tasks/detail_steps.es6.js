Template.assistantTasksDetailSteps.helpers({
  stepsWithTaskId() {
    let taskId = this._id;
    return _.map(this.steps, function(step) {
      return _.extend({}, { taskId : taskId }, step);
    });
  },
  rThis() {
    return this;
  }
});
