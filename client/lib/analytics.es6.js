Analytics = {
  bankTimeInMinutes(task, assistantId, durationMoment) {
    let assistant = Users.findOne(assistantId);
    let customer = Users.findOneCustomer(task.requestorId);
    mixpanel.identify(task.requestorId);
    let properties = {
      taskId : task._id,
      taskTitle : task.title,
      minutesAdded : Math.ceil(durationMoment.valueOf() / 1000 / 60)
    };
    mixpanel.track('Bank Time', properties);
    mixpanel.identify(assistantId);
  },
  createRequest(task, assistantId) {
    let assistant = Users.findOne(assistantId);
    let customer = Users.findOneCustomer(task.requestorId);
    mixpanel.identify(task.requestorId);
    let properties = {
      taskId : task._id,
      taskTitle : task.title,
    };
    mixpanel.track('Create Request', properties);
    mixpanel.identify(assistantId);
  }

};
