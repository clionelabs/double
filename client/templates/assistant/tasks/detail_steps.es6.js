let _submitFn = (data, form, taskId) => {
  let text = form.target.text.value;
  Tasks.Steps.add(text, taskId,
      () => {
        form.target.reset();
        data.isStepFormShown = false;
        isStepFormShownDep.changed();
      });
};

let isStepFormShownDep = new Tracker.Dependency();

Template.assistantTasksDetailStep.onRendered(function() {
  let selfTemplate = this;
  Template.currentData().isStepFormShown = false;
  selfTemplate.$('.sub').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.link-title').focus();
    }
  });
});

Template.assistantTasksDetailStep.helpers({
  isStepFormShown() {
    isStepFormShownDep.depend();
    return Template.currentData().isStepFormShown ? "" : "not-shown";
  },
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
    Template.currentData().isStepFormShown = true;
    isStepFormShownDep.changed();
  },
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(Template.currentData(), e, this._id);
  },
  "keyup form.add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Template.currentData().isStepFormShown = false;
      isStepFormShownDep.changed();
    }
  },
  "click .check" : function(e) {
    Tasks.Steps.toggleComplete(this.taskId, this._id);
  },
  "click .delete" : function(e) {
    Tasks.Steps.delete(this.taskId, this._id);
  }
});
