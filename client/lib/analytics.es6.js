Analytics = {
  bankTimeInMinutes(task, assistantId, durationMoment) {
    let assistant = Users.findOne(assistantId);
    let customer = Users.findOneCustomer(task.requestorId);
    analytics.identify(task.requestorId);
    let properties = {
      byAssistantId: assistantId,
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
      taskTitle : task.title,
      byAssistantId : task.responderId
    };
    analytics.track('Create Request', properties);
    analytics.identify(assistantId);
  }

};
