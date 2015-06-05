Template.assistantTasksTimeSheetEdit.helpers({
  getTimesheetsWithTaskId() {
    let task = this;
    if (task.timesheets && task.timesheets[Meteor.userId()]) {
      return _.map(task.timesheets[Meteor.userId()],
          (timesheet) => {
            return _.extend({ taskId: task._id }, timesheet);
          });
    } else {
      return [];
    }
  }
});


Template.timesheetItem.onRendered(function() {
  let timesheet = this.data;
  this.$('.edit').daterangepicker({
    startDate : moment(timesheet.startedAt),
    endDate : moment(timesheet.endedAt),
    maxDate: moment(),
    timePickerIncrement: 1,
    timePicker : true,
    timePicker12Hour : false,
    timePickerSeconds : true,
    open : "left"
  });
  this.$('.edit').on('apply.daterangepicker', function(event, picker) {
    Tasks.editWork(timesheet.taskId, Meteor.userId(), timesheet._id, picker.startDate.valueOf(), picker.endDate.valueOf());
  });
});