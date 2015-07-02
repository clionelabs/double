let _submitFn = (data, form, taskId) => {
  let title = form.target.title.value;
  let url = form.target.url.value;
  Tasks.References.add(title, url, taskId,
      () => {
        form.target.reset();
        data.isLinkFormShown = false;
        isLinkFormShownDep.changed();
      });
};

Template.assistantTasksDetailLinkForm.onCreated(function() {
  Template.currentData().isLinkFormShown = new ReactiveVar(false);
});

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
    let taskId = this._id;
    return _.map(this.references, function(reference) {
      return _.extend({}, { taskId : taskId }, reference);
    });
  },
  isLinkFormShown() {
    let task = Template.currentData();
    return task.isLinkFormShown.get() ? "" : "not-shown";
  }
});

Template.assistantTasksDetailLinkForm.events({
  "click i.add" : function() {
    Template.currentData().isLinkFormShown.set(true);
  },
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(Template.currentData(), e, this._id);
  },
  "keyup form.add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Template.currentData().isLinkFormShown.set(false);
    }
  },
  "click .delete" : function(e) {
    Tasks.References.delete(this.taskId, this._id);
  }
});
