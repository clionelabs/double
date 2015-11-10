Tasks.find({ completedAt : null }).observe({
  changed(newTask, oldTask) {
    if (newTask.lastModified === oldTask.lastModified) {
      Tasks.update({_id: newTask._id}, {$set: {lastModified: moment().valueOf()}});
    }
  },
  removed(oldTask) {
    const newTask = Tasks.findOne(oldTask._id);
    if (newTask && newTask.completedAt && !oldTask.completedAt) {
      const url = Router.routes['assistant.tasks'].url({ _id : newTask._id });
      const customer = Users.findOneCustomer({ _id : newTask.requestorId });
      SlackLog.log('_completed_requests',
        {
          text : `\'${newTask.title}\' has been completed for ${customer.displayName()} in ${newTask.totalDurationInMinutes()} minutes. ${url}` ,
          username: 'Double A.I. Parts',
          unfurl_links: true,
          icon_emoji: ':robot_face:'
        });
    }
  }
});
