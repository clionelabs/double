Analytics = {
  bankTimeInMinutes(task, userId, durationMoment, reason) {
    analytics.identify(task.requestorId);
    let properties = {
      byAssistantId : userId,
      assistantName : Users.findOne(userId).displayName(),
      customerName : Users.findOneCustomer(task.requestorId).displayName(),
      taskTitle : task.title,
      taskId : task._id,
      reason : reason,
      minutesAdded : durationMoment.valueOf() / 1000 / 60
    };
    if (reason) {
      _.extend(properties, { reason : reason });
    }
    analytics.track('Bank Time in Minutes', properties);
    analytics.identify(userId);
  }
};
