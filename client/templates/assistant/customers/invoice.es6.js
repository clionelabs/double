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
    let statuses = _.clone(this.statuses);
    let title = this.title;

    let result = [];

    _.each(_.keys(timesheets), (userId)=>{
      timesheets[userId] = _.filter(timesheets[userId], (timesheet)=> {
        return timesheet.startedAt >= from && timesheet.startedAt < to;
      });
      statuses[userId] = _.filter(statuses[userId], (status)=> {
        return status.createdAt >= from && status.createdAt < to;
      });

      _.each(timesheets[userId], (timesheet, index, tss) => {
        let iS = 0;
        let tsUserId = userId;
        let tsStatuses = [];
        let endAt = tss[index + 1] ? tss[index + 1].startedAt : to;

        while (statuses[userId][iS] && statuses[userId][iS].createdAt < endAt) {
          tsStatuses.push(statuses[userId][iS]);
          iS++;
        }

        timesheet = _.extend(timesheet, { userId : tsUserId, statuses : tsStatuses });
      });
      result = result.concat(timesheets[userId]);
    });

    return result;

  }

});

