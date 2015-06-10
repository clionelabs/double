Template.invoice.helpers({
  getTasksWithQuery() {
    let tasks = this.tasks.fetch();
    let extendTask = (from, to, task) => {
      return _.extend({
        queryRange : {
          from: from,
          to: to
        }
      }, task);
    };
    return _.map(tasks, _.partial(extendTask, this.from, this.to));
  }
});

Template.taskInvoiceItem.helpers({
  getTimeSheets() {
    let reduceTimeSheet = (startedAt, endedAt, statuses, memo, timesheetsOfUser, userId) => {
      let attachOwnerIdAndStatusesToTimesheet = (statuses, timesheet, index) => {
        let statusesAfter = startedAt;
        if (index !== 0) {
          statusesAfter = timesheet.startedAt;
        }

        let statusesBefore = endedAt;
        if (timesheetsOfUser[index+1]) {
          statusesBefore = timesheetsOfUser[index+1].startedAt;
        }

        let statusesInRange = _.filter(statuses[userId], (status) => {
          return status.createdAt >= statusesAfter && status.createdAt < statusesBefore;
        });

        return _.extend({ userId: userId, statuses : statusesInRange }, timesheet);
      };

      let timesheetsWithOwnerIdAndStatuses
          = _.map(timesheetsOfUser, _.partial(attachOwnerIdAndStatusesToTimesheet, statuses));
      return memo.concat(timesheetsWithOwnerIdAndStatuses);
    };

    let filterTimesheet = (from, to, timesheetsOfUser, ownerId, timesheets) => {
      timesheets[ownerId] = _.filter(timesheetsOfUser, (timesheet) => {
        return timesheet.startedAt >= from && timesheet.startedAt < to;
      });
    };

    let timesheets = _.clone(this.timesheets);
    _.each(timesheets, _.partial(filterTimesheet, this.queryRange.from, this.queryRange.to));

    return _.reduce(timesheets,
        _.partial(reduceTimeSheet, this.queryRange.from, this.queryRange.to, this.statuses), []);
  }

});

