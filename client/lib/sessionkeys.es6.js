SessionKeys = {
  genStatusFormKey : (taskId, isCurrent) => {
    return "isStatusFormShown" + "." + taskId  + (isCurrent ? ".current" : "");
  },
  currentTimeUsed : "currentTimeUsed",
  isCalling : "isCalling",
  isSidebarVisible : "IS_SIDEBAR_VISIBLE",
  activeTab : "activeTab"
};
