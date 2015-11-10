Template.assistantTasksTimeSheetEdit.helpers({
  sortedDurations() {
    return _.sortBy(this.durations, function(duration) { return duration.date * -1; });
  }
});
Template.timesheetItem.onCreated(function() {
  Template.instance().isEditing = new ReactiveVar(false);
});

Template.timesheetItem.events({
  "click .edit" : function() {
    Template.instance().isEditing.set(true);
  },
  "click .delete" : function(e, tmpl) {
    let duration = Template.currentData();
    let stepWithTaskId = Template.parentData();
    Tasks.Steps.Durations.delete(
        stepWithTaskId.taskId, stepWithTaskId._id, duration._id,
        function () {
          tmpl.isEditing.set(false);
        });
  },
  "keyup input" : function(e, tmpl) {
    if (e.keyCode === 27) {
      tmpl.isEditing.set(false);
    } else if (e.keyCode === 13) {
      tmpl.$('.submit').click();
    }
  },
  "click .submit" : function(e, tmpl) {
    let loadingSpinner = tmpl.$('.loading');
    loadingSpinner.removeClass('hide');

    let duration = Template.currentData();
    let stepWithTaskId = Template.parentData();
    let date = moment(tmpl.$('input[name="date"]').val()).valueOf();
    let value = moment.duration(tmpl.$('input[name="duration"]').val()).asMilliseconds();
    Tasks.Steps.Durations.edit(
        stepWithTaskId.taskId, stepWithTaskId._id, duration._id,
        date, value, function() {
          tmpl.isEditing.set(false);
          loadingSpinner.addClass('hide');
        });
  }
});

Template.timesheetItem.helpers({
  hideIf() {
    const stepWithTaskId = Template.parentData();
    const taskOwnerId = Tasks.findOne(stepWithTaskId.taskId).requestorId;
    return moment(Invoices.findLastBilledDate(taskOwnerId)) > this.createdAt ? "hide" : "";
  },
  assistantName() {
    const userId = this.assistantId;
    if (userId) {
      return Users.findOneAssistant(userId).displayName();
    }
  }
});