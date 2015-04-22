SessionKeys = {
  currentTask : "currentTask",
  isStatusFormShown : "isStatusFormShown",
  genStatusFormKey : (taskId, isCurrent) => {
    return SessionKeys.isStatusFormShown + "." + taskId  + (isCurrent ? ".current" : "");
  }
};
