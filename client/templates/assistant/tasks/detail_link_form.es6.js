Template.assistantTasksDetailLinkForm._submitFn = (form, taskId, isCurrent) => {
  let title = form.target.title.value;
  let url = form.target.url.value;
  Tasks.References.add(title, url, taskId,
      () => {
        form.target.reset();
        Session.setAuth(SessionKeys.genLinkFormKey(taskId, isCurrent), false);
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
    return Session.get(SessionKeys.genLinkFormKey(this._id, this.isCurrent)) ? "" : "not-shown";
  },
  genFormKey : function(taskId, isCurrent) {
    return SessionKeys.genLinkFormKey(taskId, isCurrent);
  }
});

Template.assistantTasksDetailLinkForm.events({
  "submit .task-link-add" : function(e) {
    e.preventDefault();
    return Template.assistantTasksDetailLinkForm._submitFn(e, this._id, this.isCurrent);
  },
  "keyup .task-link-add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genLinkFormKey(this._id, this.isCurrent), false);
    }
  }
});
