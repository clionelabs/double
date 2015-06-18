Template.assistantTasksDetailDescriptionForm._submitFn = (form, taskId) => {
  let description = form.target.description.value;
  Tasks.Description.edit(description, taskId,
      () => {
        Session.setAuth(SessionKeys.genDescriptionFormKey(taskId), false);
      });
};

Template.assistantTasksDetailDescriptionForm.helpers({
  isDescriptionFormShown : function() {
    return Session.get(SessionKeys.genDescriptionFormKey(this._id)) ? "" : "hide";
  },
  isDescriptionShown : function() {
    return Session.get(SessionKeys.genDescriptionFormKey(this._id)) ? "hide" : "";
  },
  genFormKey : function(taskId) {
    return SessionKeys.genDescriptionFormKey(taskId);
  }
});

Template.assistantTasksDetailDescriptionForm.events({
  'click .edit-description': function(e) {
    Session.setAuth(SessionKeys.genDescriptionFormKey(this._id), true);
  },
  "submit .task-description-edit" : function(e) {
    e.preventDefault();
    return Template.assistantTasksDetailDescriptionForm._submitFn(e, this._id);
  },
  "keypress .task-description-edit textarea" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genDescriptionFormKey(this._id), false);
    } else if (e.shiftKey && e.keyCode === 13) {
      e.preventDefault();
      $('.task-description-edit').submit();
    }
  }
});
