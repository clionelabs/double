Tasks.OneTimePurchases = {
  add : (date, amount, title, taskId, cb) => {
    let oneTimePurchase = {
      status : Tasks.OneTimePurchase.Status.PENDING,
      _id : Random.id(),
      date : date,
      amount : amount,
      title : title,
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
  },
  findOne : (_id, taskId) => {
    const task = Tasks.findOne(taskId);
    const oneTimePurchase = _.first(_.filter(task.oneTimePurchases, function(otp) { return otp._id === _id }));
    return oneTimePurchase ? _.extend(oneTimePurchase, { taskId : taskId }, Tasks.OneTimePurchase.ProtoType) : null;
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
  ProtoType : {
    extraCharge() {
      return parseFloat(accounting.toFixed(this.amount * 0.05, 2));
    },
    totalAmount() {
      return parseFloat(accounting.toFixed(this.amount, 2)) + this.extraCharge();
    }
  }
};
