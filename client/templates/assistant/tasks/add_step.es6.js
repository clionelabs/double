let _submitFn = (data, form, taskId) => {
  let text = form.target.text.value;
  Tasks.Steps.add(text, taskId,
      () => {
        form.target.reset();
        data.isStepFormShown.set(false);
      });
};

Template.assistantTasksAddStep.onCreated(function() {

  _.extend(this, {
    isStepFormShown: new ReactiveVar(false)
  });
});

Template.assistantTasksAddStep.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.sub').on('transitionend onanimationend', function(e) {
    console.log('file');
    if ($(e.target).height() > 1) {
      selfTemplate.$('.text').focus();
    }
  });
  selfTemplate.$('[data-toggle="tooltip"]').tooltip();
});

Template.assistantTasksAddStep.helpers({
  isStepFormShown() {
    return Template.instance().isStepFormShown.get() ? "" : "not-shown";
  }
});

Template.assistantTasksAddStep.events({
  "click .add-step" : function(e, tmpl) {
    tmpl.isStepFormShown.set(true);
  },
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(Template.currentData(), e, this._id);
  },
  "keyup form.add input" : function(e, tmpl) {
    if (e.keyCode === 27) {//esc
      tmpl.isStepFormShown.set(false);
    }
  }
});
