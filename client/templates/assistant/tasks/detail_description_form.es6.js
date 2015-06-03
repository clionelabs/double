Template.assistantTasksDetailDescriptionForm._submitFn = (form, taskId, isCurrent) => {
  let description = form.target.description.value;
  Tasks.Description.edit(description, taskId,
      () => {
        Session.setAuth(SessionKeys.genDescriptionFormKey(taskId, isCurrent), false);
      });
};

Template.assistantTasksDetailDescriptionForm.helpers({
  isDescriptionFormShown : function() {
    return Session.get(SessionKeys.genDescriptionFormKey(this._id, this.isCurrent)) ? "" : "hide";
  },
  isDescriptionShown : function() {
    return Session.get(SessionKeys.genDescriptionFormKey(this._id, this.isCurrent)) ? "hide" : "";
  },
  genFormKey : function(taskId, isCurrent) {
    return SessionKeys.genDescriptionFormKey(taskId, isCurrent);
  }
});

Template.assistantTasksDetailDescriptionForm.events({
  "submit .task-description-edit" : function(e) {
    e.preventDefault();
    return Template.assistantTasksDetailDescriptionForm._submitFn(e, this._id, this.isCurrent);
  },
  "keypress .task-description-edit textarea" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genDescriptionFormKey(this._id, this.isCurrent), false);
    } else if (e.shiftKey && e.keyCode === 13) {
      e.preventDefault();
      $('.task-description-edit').submit();
    }
  }
});
