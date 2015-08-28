Analytics = {
  bankTimeInMinutes(task, userId, durationMoment, reason) {
    let assistant = Users.findOne(userId);
    let customer = Users.findOneCustomer(task.requestorId);
    let properties = {
      byAssistantId : userId,
      assistantName : assistant.displayName(),
      customerName : customer.displayName(),
      taskTitle : task.title,
      taskId : task._id,
      reason : reason,
      minutesAdded : Math.ceil(durationMoment.valueOf() / 1000 / 60)
    };
    if (reason) {
      _.extend(properties, { reason : reason });
    }
    analytics.track('Bank Time in Minutes', properties);
  }
};
