let _getCurrentTaskSelector = {
  $where: function () {
    _.extend(this, Task.Prototype);
    return this.isWorking();
  }
};

Template.assistantTasksDashboard.getRunningTask = () => {
  return Tasks.findOne(_getCurrentTaskSelector);
};

Template.assistantTasksDashboard.onRendered(function() {
  Tasks.find(_getCurrentTaskSelector).observe({
    added(task) {
      //Modal.show need a function argument to be reactive #gotcha
      Modal.show("assistantTasksRunning", Template.assistantTasksDashboard.getRunningTask);
    },
    removed() {
      Modal.hide("assistantTasksRunning");
    }
  });
});


Template.assistantTasksDashboard.helpers({
  getCurrentTask() {
    return Task.transform(Session.get(SessionKeys.CURRENT_TASK));
  }
});
