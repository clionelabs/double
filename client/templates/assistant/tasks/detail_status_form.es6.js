Template.assistantTasksDetailStatusForm._submitFn = (form, taskId, isCurrent) => {
  let message = form.target.message.value;
  Tasks.Status.change(message, taskId,
      () => {
        form.target.reset();
        Session.setAuth(SessionKeys.genStatusFormKey(taskId, isCurrent), false);
      });
};

Template.assistantTasksDetailStatusForm.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.form-container').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.status-message').focus();
    }
  });
});

Template.assistantTasksDetailStatusForm.helpers({
  isStatusFormShown : function() {
    return Session.get(SessionKeys.genStatusFormKey(this._id, this.isCurrent)) ? "" : "not-shown";
  },
  genFormKey : function(taskId, isCurrent) {
    return SessionKeys.genStatusFormKey(taskId, isCurrent);
  }
});

Template.assistantTasksDetailStatusForm.events({
  "submit .task-status-change" : function(e) {
    e.preventDefault();
    return Template.assistantTasksDetailStatusForm._submitFn(e, this._id, this.isCurrent);
  },
  "keyup .task-status-change input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genStatusFormKey(this._id, this.isCurrent), false);
    }
  }
});
