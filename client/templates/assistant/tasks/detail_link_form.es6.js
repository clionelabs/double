Template.assistantTasksDetailLinkForm._submitFn = (form, taskId) => {
  let title = form.target.title.value;
  let url = form.target.url.value;
  Tasks.References.add(title, url, taskId,
      () => {
        form.target.reset();
        Session.setAuth(SessionKeys.genLinkFormKey(taskId), false);
      });
};

Template.assistantTasksDetailLinkForm.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.form-container').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.link-title').focus();
    }
  });
});

Template.assistantTasksDetailLinkForm.helpers({
  isLinkFormShown : function() {
    return Session.get(SessionKeys.genLinkFormKey(this._id)) ? "" : "not-shown";
  },
  genFormKey : function(taskId) {
    return SessionKeys.genLinkFormKey(taskId);
  }
});

Template.assistantTasksDetailLinkForm.events({
  "submit .task-link-add" : function(e) {
    e.preventDefault();
    return Template.assistantTasksDetailLinkForm._submitFn(e, this._id);
  },
  "keyup .task-link-add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genLinkFormKey(this._id), false);
    }
  }
});
