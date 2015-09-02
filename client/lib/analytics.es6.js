Analytics = {
  bankTimeInMinutes(task, userId, durationMoment, reason) {
    let assistant = Users.findOne(userId);
    let customer = Users.findOneCustomer(task.requestorId);
    analytics.identify(task.requestorId, {
      email: customer.emails[0].address,
      name: customer.displayName()
    });
    let properties = {
      byAssistantId: task.responderId,
      taskTitle : task.title,
      minutesAdded : Math.ceil(durationMoment.valueOf() / 1000 / 60)
    };
    if (reason) {
      _.extend(properties, { reason : reason });
    }
    analytics.track('Bank Time', properties);
    analytics.identify(userId, {
      email: assistant.emails[0].address,
      name: assistant.displayName()
    });
  }
};
