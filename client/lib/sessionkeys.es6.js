SessionKeys = {
  genLinkFormKey : (taskId) => {
    return "isLinkFormShown" + "." + taskId;
  },
  genStepFormKey : (taskId) => {
    return "isStepFormShown" + "." + taskId;
  },
  genDescriptionFormKey : (taskId) => {
    return "isDescriptionFormShown" + "." + taskId;
  },
  IS_CALLING : "IS_CALLING",
  IS_CONNECTED : "IS_CONNECTED",
  IS_SIDEBAR_VISIBLE : "IS_SIDEBAR_VISIBLE",
  ACTIVE_TAB : "ACTIVE_TAB",
  SECRET : "SECRET",

  CURRENT_UNASSIGNED_CHANNEL_ID: "SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID",
  UNASSIGNED_SHOW_SPAM: "UNASSIGNED_SHOW_SPAM"
};
