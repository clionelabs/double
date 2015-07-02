let _submitFn = (data, form, taskId) => {
  let description = form.target.description.value;
  Tasks.Description.edit(description, taskId,
      () => {
        data.isDescriptionFormShown = false;
        isDescriptionFormShownDep.changed();
      });
};
let isDescriptionFormShownDep = new Tracker.Dependency();

Template.assistantTasksDetailDescriptionForm.onCreated(function() {
  Template.currentData().isDescriptionFormShown = false;
  isDescriptionFormShownDep.changed();
});

Template.assistantTasksDetailDescriptionForm.helpers({
  isDescriptionFormShown : function() {
    isDescriptionFormShownDep.depend();
    return Template.currentData().isDescriptionFormShown ? "" : "hide";
  },
  isDescriptionShown : function() {
    isDescriptionFormShownDep.depend();
    return Template.currentData().isDescriptionFormShown ? "hide" : "";
  }
});

Template.assistantTasksDetailDescriptionForm.events({
  'click i.edit': function(e) {
    Template.currentData().isDescriptionFormShown = true;
    isDescriptionFormShownDep.changed();
  },
  "submit form.edit" : function(e) {
    e.preventDefault();
    return _submitFn(Template.currentData(), e, this._id);
  },
  "keypress form.edit textarea" : function(e, tmpl) {
    if (e.shiftKey && e.keyCode === 13) {
      e.preventDefault();
      $(tmpl.$('form.edit')[0]).submit();
    }
  },
  "keyup form.edit textarea" : function(e) {
    if (e.keyCode === 27) {//esc
      Template.currentData().isDescriptionFormShown = false;
      isDescriptionFormShownDep.changed();
    }
  }
});

