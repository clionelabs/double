SessionKeys = {
  currentTask : "currentTask",
  genStatusFormKey : (taskId, isCurrent) => {
    return "isStatusFormShown" + "." + taskId  + (isCurrent ? ".current" : "");
  }
};
