SessionKeys = {
  genStatusFormKey : (taskId, isCurrent) => {
    return "isStatusFormShown" + "." + taskId  + (isCurrent ? ".current" : "");
  },
  currentTimeUsed : "currentTimeUsed"
};
