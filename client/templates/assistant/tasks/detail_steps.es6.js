
Template.assistantTasksDetailStep.helpers({
  isCompletedCheckbox() {
    return this.isCompleted ? "fa-check-square-o" : "fa-square-o";
  },
  stepsWithTaskId() {
    let taskId = this._id;
    return _.map(this.steps, function(step) {
      return _.extend({}, { taskId : taskId }, step);
    });
  }
});

Template.assistantTasksDetailStep.events({
  "click i.add" : function() {
    Template.currentData().isStepFormShown.set(true);
  },
  "click .check" : function(e) {
    Tasks.Steps.toggleComplete(this.taskId, this._id);
  },
  "click .delete" : function(e) {
    Tasks.Steps.delete(this.taskId, this._id);
  }
});
