Tasks.OneTimePurchases = {
  add : (date, amount, title, isOnBehalf, taskId, cb) => {
    let oneTimePurchase = {
      status : Tasks.OneTimePurchase.Status.PENDING,
      _id : Random.id(),
      date : date,
      amount : amount,
      title : title,
      isOnBehalf : isOnBehalf,
      createdAt : moment().valueOf()
    };
    return Tasks.update ({ _id : taskId }, { $push : { oneTimePurchases : oneTimePurchase }}, cb);
  },
  delete : (oneTimePurchaseId, taskId, cb) => {
    let oneTimePurchases = Tasks.findOne(taskId).oneTimePurchases;
    oneTimePurchases = _.filter(oneTimePurchases, function(oneTimePurchase) {
      return oneTimePurchase._id !== oneTimePurchaseId;
    });
    return Tasks.update ({ _id : taskId }, { $set : { oneTimePurchases : oneTimePurchases }}, cb);
  },
  updateStatus : (oneTimePurchaseId, taskId, status, cb) => {
    let oneTimePurchases = Tasks.findOne(taskId).oneTimePurchases;
    _.each(oneTimePurchases, function(oneTimePurchase) {
      if (oneTimePurchase._id === oneTimePurchaseId) {
        oneTimePurchase.status = status;
      }
    });
    return Tasks.update ({ _id : taskId }, { $set : { oneTimePurchases : oneTimePurchases }}, cb);
  }

};

Tasks.OneTimePurchase = {
  Status : {
    PENDING : 'pending',
    CHARGING : 'charging',
    CHARGED : 'charged',
    FAILED: 'failed',
    VOIDED: 'voided'
  },
  StateMachine : (oneTimePurchase, taskId) => {
    let initialState = 'none';
    if (oneTimePurchase.status) {
      initialState = oneTimePurchase.status;
    }
    let stateMachine = StateMachine.create({
      initial: {state: initialState, event: 'init', defer: true },
      error: function(eventName, from, to, args, errorCode, errorMessage) {
        let error = 'event ' + eventName + ' was naughty :- ' + errorMessage;
        console.log(error);
        return error;
      },
      events: [
        {name: 'transactionCreated', from: 'pending', to: 'charging' },
        {name: 'transactionSucceed', from: 'charging', to: 'charged'},
        {name: 'transactionFailed', from: 'charging', to: 'failed'},
        {name: 'transactionVoided', from: 'charging', to: 'voided'}
      ],
      callbacks: {
        onenterstate: function(event, from, to) {
          if (from === 'none') return;
          const oneTimePurchase = this;
          Tasks.OneTimePurchases.updateStatus(oneTimePurchase._id, oneTimePurchase.taskId,  to);
        },
        ontransactionCreated(event, from, to) {
          let oneTimePurchase = this;
          let data = {
            oneTimePurchaseId: oneTimePurchase._id,
            taskId: oneTimePurchase.taskId,
            amount: oneTimePurchase.amount
          };
          D.Events.create('newTransaction', data); // call double.pay to create a transaction

        },
        ontransactionSucceed(event, from, to) {

        },
        ontransactionFailed(event, from, to) {

        },
        ontransactionVoided(event, from, to) {

        },
      }
    });
    _.extend(oneTimePurchase, { taskId : taskId });
    _.extend(oneTimePurchase, stateMachine);
    oneTimePurchase.init();
  },
};
