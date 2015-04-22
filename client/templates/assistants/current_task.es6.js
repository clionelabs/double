Template.currentTask.helpers({
  currentTaskTemplate : ()=> {
    return Template.assistantDashboardCustomerTab.getCurrentTask() ? "assistantTask" : null;
  }
});