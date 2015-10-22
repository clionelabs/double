Tasks.find({ completedAt : null }).observe({
  changed(newTask, oldTask) {
    if (newTask.lastModified === oldTask.lastModified) {
      Tasks.update({_id: newTask._id}, {$set: {lastModified: moment().valueOf()}});
    }
  },
  removed(oldTask) {
    const newTask = Tasks.findOne(oldTask._id);
    if (newTask && newTask.completedAt && !oldTask.completedAt) {
      SlackLog.log('_completed_requests', { text : `${newTask.title} has been completed.` });
    }
  }
});

