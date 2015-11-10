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
      SlackLog.log('_completed_requests',
        {
          text : `
<!channel>, ${newTask.title}(${url}) has been completed in ${newTask.totalDurationInMinutes()} minutes.` ,
          username: 'Double A.I. Parts',
          unfurl_links: true,
          icon_emoji: ':robot_face:'
        });
    }
  }
});
