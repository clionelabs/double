Tasks.find({ completedAt : null }).observe({
  changed(newTask, oldTask) {
    if (newTask.lastModified === oldTask.lastModified) {
      Tasks.update({_id: newTask._id}, {$set: {lastModified: moment().valueOf()}});
    }
  },
  removed(oldTask) {
    const newTask = Tasks.findOne(oldTask._id);
    if (newTask && newTask.completedAt && !oldTask.completedAt) {
      SlackLog.log('_completed_requests',
        {
          text : `
<!channel>, ${newTask.title}(${Meteor.absoluteUrl()}assistant/tasks/${newTask._id} has been completed. Send a email to collect feedback maybe?` ,
          username: 'Double A.I. Parts',
          unfurl_links: true,
          icon_emoji: ':robot_face:'
        });
    }
  }
});

