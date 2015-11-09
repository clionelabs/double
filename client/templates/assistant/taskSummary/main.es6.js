Template.assistantTasksSummary.helpers({
  tasks() {
    return Tasks.find({completedAt: null}, {sort: {lastModified: 1}}).map(function(task) {
      let customer = D.Users.findOneCustomer(task.requestorId);
      let customerName = customer.displayName();
      let isAlert = moment(task.lastModified).add(1, 'hours').isBefore(moment());
      return _.extend(task, {
        customerName: customerName,
        isAlert: isAlert
      })
    });;
  }
});

Template.assistantTasksSummaryTask.helpers({
  lastStatus() {
    let statuses = [];
    _.each(this.statuses, (userStatuses, userId) => {
      statuses = statuses.concat(userStatuses);
    });
    let lastStatus = _.last(_.sortBy(statuses, 'createdAt'));
    return lastStatus? lastStatus.message: '--';
  },

  taskURL() {
    let task = this;
    let url = Router.routes['assistant.tasks'].url({_id: task._id});
    return url;
  }
});
