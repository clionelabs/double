Analytics = {
  bankTimeInMinutes(task, assistantId, durationMoment, reason) {
    let assistant = Users.findOne(assistantId);
    let customer = Users.findOneCustomer(task.requestorId);
    analytics.identify(task.requestorId, {
      email: customer.emails[0].address,
      name: customer.displayName()
    });
    let properties = {
      byAssistantId: assistantId,
      taskTitle : task.title,
      minutesAdded : Math.ceil(durationMoment.valueOf() / 1000 / 60)
    };
    if (reason) {
      _.extend(properties, { reason : reason });
    }
    analytics.track('Bank Time', properties);
    analytics.identify(assistantId, {
      email: assistant.emails[0].address,
      name: assistant.displayName()
    });
  },
  createRequest(task, assistantId) {
    let assistant = Users.findOne(assistantId);
    let customer = Users.findOneCustomer(task.requestorId);
    analytics.identify(task.requestorId, {
      email: customer.emails[0].address,
      name: customer.displayName()
    });
    let properties = {
      taskTitle : task.title,
      byAssistantId : task.responderId
    };
    analytics.track('Create Request', properties);
    analytics.identify(assistantId, {
      email: assistant.emails[0].address,
      name: assistant.displayName()
    });
  }

};
