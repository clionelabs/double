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
    let from = this.queryRange.from;
    let to = this.queryRange.to;
    let timesheets = _.clone(this.timesheets);
    _.each(timesheets,
        (timesheetsOfUser, ownerId, timesheets) => {
          timesheets[ownerId] = _.filter(timesheetsOfUser, (timesheet) => {
            return timesheet.startedAt >= from && timesheet.startedAt < to;
          });
        });
    let statuses = this.statuses;

    return _.reduce(timesheets,
        (memo, timesheetsOfUser, userId) => {

          let timesheetsWithOwnerIdAndStatuses
              = _.map(timesheetsOfUser,
                    (timesheet, index) => {
                      let statusesAfter = from;
                      if (index !== 0) {
                        statusesAfter = timesheet.startedAt;
                      }

                      let statusesBefore = to;
                      if (timesheetsOfUser[index+1]) {
                        statusesBefore = timesheetsOfUser[index+1].startedAt;
                      }

                      let statusesInRange = _.filter(statuses[userId], (status) => {
                        return status.createdAt >= statusesAfter && status.createdAt < statusesBefore;
                      });

                      return _.extend({ userId: userId, statuses : statusesInRange }, timesheet);
                    });
          return memo.concat(timesheetsWithOwnerIdAndStatuses);
        },
        []);
  }

});

