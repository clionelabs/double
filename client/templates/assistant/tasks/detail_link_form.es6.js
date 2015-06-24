let _submitFn = (form, taskId) => {
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
  selfTemplate.$('.sub').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.link-title').focus();
    }
  });
});

Template.assistantTasksDetailLinkForm.helpers({
  references() {
    return this.references;
  },
  isLinkFormShown() {
    return Session.get(SessionKeys.genLinkFormKey(this._id)) ? "" : "not-shown";
  },
  genFormKey(taskId) {
    return SessionKeys.genLinkFormKey(taskId);
  }
});

Template.assistantTasksDetailLinkForm.events({
  "click i.add" : function() {
    Session.setAuth(SessionKeys.genLinkFormKey(this._id), true);
  },
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(e, this._id);
  },
  "keyup form.add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genLinkFormKey(this._id), false);
    }
  },
  "click .delete" : function(e) {
    let taskId = Session.get(SessionKeys.CURRENT_TASK)._id;
    Tasks.References.delete(taskId, this._id);
  }
});
