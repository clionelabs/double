Mixpanel = {
  clearUp() {
    mixpanel.unregister('$name');
    mixpanel.unregister('$email');
    mixpanel.unregister('$first_name');
    mixpanel.unregister('$last_name');
  }
};

Analytics = {
  bankTimeInMinutes(task, assistantId, durationMoment) {
    let assistant = Users.findOne(assistantId);
    let customer = Users.findOneCustomer(task.requestorId);
    analytics.identify(task.requestorId);
    let properties = {
      taskId : task._id,
      taskTitle : task.title,
      minutesAdded : Math.ceil(durationMoment.valueOf() / 1000 / 60)
    };
    analytics.track('Bank Time', properties);
    analytics.identify(assistantId);
  },
  createRequest(task, assistantId) {
    let assistant = Users.findOne(assistantId);
    let customer = Users.findOneCustomer(task.requestorId);
    analytics.identify(task.requestorId);
    let properties = {
      taskId : task._id,
      taskTitle : task.title,
    };
    analytics.track('Create Request', properties);
    analytics.identify(assistantId);
  },
  increaseRevenue(invoice, assistantId) {
    mixpanel.identify(invoice.customerId);
    mixpanel.people.track_charge(invoice.revenue(), { '$time' : moment(invoice.to).format('YYYY-MM-DDTHH:mm:ss')});
    mixpanel.identify(assistantId);
  }
};
