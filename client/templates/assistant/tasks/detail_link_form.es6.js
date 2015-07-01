let _submitFn = (form, taskId) => {
  let title = form.target.title.value;
  let url = form.target.url.value;
  Tasks.References.add(title, url, taskId,
      () => {
        form.target.reset();
        selfTemplate.data.isLinkFormShown = false;
        isLinkFormShownDep.changed();
      });
};

let isLinkFormShownDep = new Tracker.Dependency();

Template.assistantTasksDetailLinkForm.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.data.isLinkFormShown = false;
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
      return _.extend({}, { taskId : taskId },reference);
    });
  },
  isLinkFormShown() {
    let task = Template.currentData();
    isLinkFormShownDep.depend();
    return task.isLinkFormShown ? "" : "not-shown";
  }
});

Template.assistantTasksDetailLinkForm.events({
  "click i.add" : function() {
    Template.currentData().isLinkFormShown = true;
    isLinkFormShownDep.changed();
  },
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(e, this._id);
  },
  "keyup form.add input" : function(e) {
    if (e.keyCode === 27) {//esc
      Template.currentData().isLinkFormShown = false;
      isLinkFormShownDep.changed();
    }
  },
  "click .delete" : function(e) {
    Tasks.References.delete(this.taskId, this._id);
  }
});
