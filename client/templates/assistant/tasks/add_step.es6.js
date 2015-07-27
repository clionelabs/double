let _submitFn = (data, form, taskId) => {
  let text = form.target.text.value;
  Tasks.Steps.add(text, taskId,
      () => {
        form.target.reset();
        data.isStepFormShown.set(false);
      });
};

Template.assistantTasksAddStep.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.sub').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.link-title').focus();
    }
  });
});

Template.assistantTasksAddStep.helpers({
  isStepFormShown() {
    return Template.currentData().isStepFormShown.get() ? "" : "not-shown";
  }
});

Template.assistantTasksAddStep.events({
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(Template.currentData(), e, this._id);
  },
  "keyup form.add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Template.currentData().isStepFormShown.set(false);
    }
  }
});
