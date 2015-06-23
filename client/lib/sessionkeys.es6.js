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
  getCustomerSelectedChannelIdKey : (customerId) => {
    return "customerSelectedChannelId" + "." + customerId;
  },
  CURRENT_TIME_USED : "CURRENT_TIME_USED",
  IS_CALLING : "IS_CALLING",
  IS_SIDEBAR_VISIBLE : "IS_SIDEBAR_VISIBLE",
  ACTIVE_TAB : "ACTIVE_TAB",
  SECRET : "SECRET",
  CURRENT_CUSTOMER: "CURRENT_CUSTOMER",
  CURRENT_ASSISTANT_TAB : "CURRENT_ASSISTANT_TAB",
  CURRENT_TASK : "CURRENT_TASK",
  CURRENT_UNASSIGNED_CHANNEL_ID: "SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID",
  UNASSIGNED_SHOW_SPAM: "UNASSIGNED_SHOW_SPAM"
};
