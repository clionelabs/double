Template.assistantTasksDetailSteps.helpers({
  stepsWithTaskId() {
    let taskId = this._id;
    return _.map(this.steps, function(step) {
      return _.extend({}, { taskId : taskId }, step);
    });
  }
});

Template.assistantTasksDetailSteps.events({
  "click i.add": function (e, tmpl) {
    Template.currentData().isStepFormShown.set(true);
    console.log(tmpl.$('.add-step-form'));
  }
});

Template.assistantTasksDetailStep.helpers({
  isCompletedCheckbox() {
    return this.isCompleted ? "fa-check-square-o" : "fa-square-o";
  }
});

Template.assistantTasksDetailStep.events({
  "click .check": function (e) {
    Tasks.Steps.toggleComplete(this.taskId, this._id);
  },
  "click .delete": function (e) {
    Tasks.Steps.delete(this.taskId, this._id);
  },
  'click .duration' : function() {
    Modal.show('assistantTasksTimeSheetEdit', this);
  }
});

Template.assistantTasksDetailStep.onRendered(function() {
  this.$('[data-toggle="tooltip"]').tooltip();
});
