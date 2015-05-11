Template.timesheetItem.onRendered(function() {
  let timesheet = this.data;
  this.$('.edit').daterangepicker({
    startDate : moment(timesheet.startedAt),
    endDate : moment(timesheet.endedAt),
    timePickerIncrement: 1,
    timePicker : true,
    timePicker12Hour : false,
    timePickerSeconds : true,
    open : "left"
  });
});