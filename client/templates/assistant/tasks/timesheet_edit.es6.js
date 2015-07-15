Template.assistantTasksTimeSheetEdit.helpers({
  getTimesheetsWithTaskId() {
    let task = this;
    if (task.timesheets) {
      return _.reduce(_.keys(task.timesheets),
          (memo, userId) => {
            let assistantName = Users.findOneAssistant({ _id : userId }).firstName();
            let result = _.map(task.timesheets[userId], (timesheet) => {
              return _.extend({}, { taskId: task._id, assistantName: assistantName }, timesheet);
            });
            return memo.concat(result);
          }, []);
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