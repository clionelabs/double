Template.assistantTasksTimeSheetEdit.helpers({
  getTimesheetsWithTaskId() {
    let task = this;
    return _.map(task.timesheets, (timesheet) => { return _.extend({ taskId : task._id }, timesheet); });
  }
});


Template.assistantTasksTimeSheetEdit.onRendered(function() {
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
    Tasks.editWork(timesheet.taskId, timesheet._id, picker.startDate.valueOf(), picker.endDate.valueOf());
  });
});