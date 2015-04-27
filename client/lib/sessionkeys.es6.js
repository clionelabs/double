SessionKeys = {
  genStatusFormKey : (taskId, isCurrent) => {
    return "isStatusFormShown" + "." + taskId  + (isCurrent ? ".current" : "");
  },
  CURRENT_TIME_USED : "CURRENT_TIME_USED",
  IS_CALLING : "IS_CALLING",
  IS_SIDEBAR_VISIBLE : "IS_SIDEBAR_VISIBLE",
  ACTIVE_TAB : "ACTIVE_TAB"
};
