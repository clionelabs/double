Tasks.OneTimePurchases.Payment = {
  _slackLog(message) {
    SlackLog.log('_one_time_charges', {
      text: message,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });
  },
  events: [
    {name: 'transactionCreated', from: 'pending', to: 'charging'},
    {name: 'transactionSucceed', from: 'charging', to: 'charged'},
    {name: 'transactionFailed', from: 'charging', to: 'failed'},
    {name: 'transactionVoided', from: 'charging', to: 'voided'}
  ],
  _attach(oneTimePurchaseWithTaskId) {
    let initialState = 'none';
    if (oneTimePurchaseWithTaskId.status) {
      initialState = oneTimePurchaseWithTaskId.status;
    }
    let stateMachine = StateMachine.create({
      initial: {state: initialState, event: 'init', defer: true},
      error: function (eventName, from, to, args, errorCode, errorMessage) {
        let error = '[TasksOneTimePurchases] event ' + eventName + ' was naughty : ('+ errorCode + ") " + errorMessage;
        console.log(error);
        return error;
      },
      events: this.events,
      callbacks: {
        onenterstate: function (event, from, to) {
          if (from === 'none') return;
          const oneTimePurchase = this;
          Tasks.OneTimePurchases.updateStatus(oneTimePurchase._id, oneTimePurchase.taskId, to);
        },
        ontransactionCreated(event, from, to) {
          const oneTimePurchaseWithTaskId = this;
          const data = {
            oneTimePurchaseId: oneTimePurchaseWithTaskId._id,
            taskId: oneTimePurchaseWithTaskId.taskId,
            amount: oneTimePurchaseWithTaskId.totalAmount(),
            type : Transaction.Type.ONE_TIME_PURCHASE
          };
          D.Events.create('newTransaction', data); // call double.pay to create a transaction
          const task = Tasks.findOne(oneTimePurchaseWithTaskId.taskId);
          Tasks.OneTimePurchases.Payment._slackLog(`One Time Charge ${oneTimePurchaseWithTaskId.title} of ${task.title} is charging.`);
        },
        ontransactionSucceed(event, from, to) {
          const oneTimePurchaseWithTaskId = this;
          const task = Tasks.findOne(oneTimePurchaseWithTaskId.taskId);
          Tasks.OneTimePurchases.Payment._slackLog(`One Time Charge ${oneTimePurchaseWithTaskId.title} of ${task.title} is charged.`);
        },
        ontransactionFailed(event, from, to) {
          const oneTimePurchaseWithTaskId = this;
          const task = Tasks.findOne(oneTimePurchaseWithTaskId.taskId);
          Tasks.OneTimePurchases.Payment._slackLog(`<!channel> One Time Charge ${oneTimePurchaseWithTaskId.title} of ${task.title} is failed.`);
        },
        ontransactionVoided(event, from, to) {
          const oneTimePurchaseWithTaskId = this;
          const task = Tasks.findOne(oneTimePurchaseWithTaskId.taskId);
          Tasks.OneTimePurchases.Payment._slackLog(`One Time Charge ${oneTimePurchaseWithTaskId.title} of ${task.title} is voided.`);
        }
      }
    });
    _.extend(oneTimePurchaseWithTaskId, stateMachine);
    oneTimePurchaseWithTaskId.init();

    return oneTimePurchaseWithTaskId;
  },
  charge(oneTimePurchaseId, taskId) {
    const oneTimePurchase = Tasks.OneTimePurchases.findOne(oneTimePurchaseId, taskId);
    this._attach(oneTimePurchase).transactionCreated();
  },
  transactionSucceed(oneTimePurchaseId, taskId) {
    const oneTimePurchase = Tasks.OneTimePurchases.findOne(oneTimePurchaseId, taskId);
    this._attach(oneTimePurchase).transactionSucceed();
  },
  transactionFailed(oneTimePurchaseId, taskId) {
    const oneTimePurchase = Tasks.OneTimePurchases.findOne(oneTimePurchaseId, taskId);
    this._attach(oneTimePurchase).transactionFailed();
  },
  transactionVoided(oneTimePurchaseId, taskId) {
    const oneTimePurchase = Tasks.OneTimePurchases.findOne(oneTimePurchaseId, taskId);
    this._attach(oneTimePurchase).transactionVoided();
  },
  startup : () => {
    D.Events.listen('transactionSuccess', function (data) {
      try {
        if (data.type !== Transaction.Type.ONE_TIME_PURCHASE) return false;
        const taskId = data.taskId;
        const oneTimePurchaseId = data.oneTimePurchaseId;
        Tasks.OneTimePurchases.Payment.transactionSucceed(oneTimePurchaseId, taskId);
        return true;
      } catch (ex) {
        console.error('[Transactions] Error in one time charge transaction success: ', ex);
        return false;
      }
    });

    D.Events.listen('transactionFailure', function (data) {
      try {
        if (data.type !== Transaction.Type.ONE_TIME_PURCHASE) return false;
        const taskId = data.taskId;
        const oneTimePurchaseId = data.oneTimePurchaseId;
        Tasks.OneTimePurchases.Payment.transactionFailed(oneTimePurchaseId, taskId);
        return true;
      } catch (ex) {
        console.error('[Transactions] Error in one time charge transaction failed: ', ex);
        return false;
      }
    });

    D.Events.listen('transactionVoid', function (data) {
      try {
        if (data.type !== Transaction.Type.ONE_TIME_PURCHASE) return false;
        const taskId = data.taskId;
        const oneTimePurchaseId = data.oneTimePurchaseId;
        Tasks.OneTimePurchases.Payment.transactionVoided(oneTimePurchaseId, taskId);
        return true;
      } catch (ex) {
        console.error('[Transactions] Error in one time charge transaction voided: ', ex);
        return false;
      }
    });
  }
};
