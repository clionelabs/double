let _submitFn = (form, taskId) => {
  let text = form.target.text.value;
  Tasks.Steps.add(text, taskId,
      () => {
        form.target.reset();
        Session.setAuth(SessionKeys.genStepFormKey(taskId), false);
      });
};

Template.assistantTasksDetailStep.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.sub').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.link-title').focus();
    }
  });
});

Template.assistantTasksDetailStep.helpers({
  isStepFormShown() {
    return Session.get(SessionKeys.genStepFormKey(this._id)) ? "" : "not-shown";
  },
  genFormKey() {
    return SessionKeys.genStepFormKey(this._id);
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
    Session.setAuth(SessionKeys.genStepFormKey(this._id), true);
  },
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(e, this._id);
  },
  "keyup form.add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genStepFormKey(this._id), false);
    }
  },
  "click .check" : function(e) {
    Tasks.Steps.toggleComplete(this.taskId, this._id);
  },
  "click .delete" : function(e) {
    Tasks.Steps.delete(this.taskId, this._id);
  }
});
