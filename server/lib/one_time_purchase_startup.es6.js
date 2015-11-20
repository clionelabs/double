OneTimePurchasesStartup = () => {
  // Listen to transactions events
  D.Events.listen('transactionSuccess', function(data) {
    try {
      const taskId = data.taskId;
      const oneTimePurchaseId = data.oneTimePurchaseId;
      if (!taskId || !oneTimePurchaseId) return false;
      console.log('[OneTimePurchase] one time purchase charged successfully');
      const task = Tasks.findOne(taskId);
      task.oneTimePurchase(oneTimePurchaseId).transactionSucceed();
      return true;
    } catch (ex) {
      return false;
    }
  });

  D.Events.listen('transactionFailure', function(data) {
    try {
      const taskId = data.taskId;
      const oneTimePurchaseId = data.oneTimePurchaseId;
      if (!taskId || !oneTimePurchaseId) return false;
      console.log('[OneTimePurchase] one time purchase failed');
      const task = Tasks.findOne(taskId);
      task.oneTimePurchase(oneTimePurchaseId).transactionFailed();
      return true;
    } catch (ex) {
      return false;
    }
  });

  D.Events.listen('transactionVoid', function(data) {
    try {
      const taskId = data.taskId;
      const oneTimePurchaseId = data.oneTimePurchaseId;
      if (!taskId || !oneTimePurchaseId) return false;
      console.log('[OneTimePurchase] one time purchase voided successfully');
      const task = Tasks.findOne(taskId);
      task.oneTimePurchase(oneTimePurchaseId).transactionVoided();
      return true;
    } catch (ex) {
      return false;
    }
  });
};
