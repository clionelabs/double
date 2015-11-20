Tasks.startup = function() {
  let initial = true;

  Tasks.find({ completedAt : null }).observe({
    added(task) {
      if (initial) return; // ignore initial

      const customer = Users.findOneCustomer({ _id : task.requestorId });
      const url = Router.routes['assistant.tasks'].url({ _id : task._id });
      SlackLog.log('_requests', {
        text : `\'${task.title}\' has been created for ${customer.displayName()}. ${url}`,
        username: 'Double A.I. Parts',
        unfurl_links: true,
        icon_emoji: ':robot_face:'
      });
    },
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
        SlackLog.log('_requests',
          {
            text : `\'${newTask.title}\' has been completed for ${customer.displayName()} in ${newTask.totalDurationInMinutes()} minutes. ${url}` ,
            username: 'Double A.I. Parts',
            unfurl_links: true,
            icon_emoji: ':robot_face:'
          });
      }
    }
  });

  initial = false;
}
