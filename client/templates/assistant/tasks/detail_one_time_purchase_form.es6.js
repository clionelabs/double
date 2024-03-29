let _submitFn = (tmpl, form, taskId) => {
  let date = moment(form.target.date.value).valueOf();
  let title = form.target.title.value;
  let amount = Number.parseFloat(form.target.amount.value);
  Tasks.OneTimePurchases.add(date, amount, title, taskId,
      () => {
        tmpl.isOneTimePurchaseFormShown.set(false);
      });
};

Template.assistantTasksDetailOneTimePurchaseForm.onCreated(function() {
  _.extend(this,
      {
        isOneTimePurchaseFormShown : new ReactiveVar(false),
        oneTimePurchaseToBeCharged : new ReactiveVar(null)
      });
});

Template.assistantTasksDetailOneTimePurchaseForm.helpers({
  isOneTimePurchaseChargeFormShown() {
    return Template.instance().oneTimePurchaseToBeCharged.get() ? "" : "hide";
  },
  isOneTimePurchaseFormShown() {
    return Template.instance().isOneTimePurchaseFormShown.get() ? "" : "hide";
  },
  today() {
    return moment().valueOf();
  },
  /*
  TODO add backed when there is last Bill Date for user
  isBilledStr() {
    return this.billedAt ? "billed" : "unbilled";
  },
  */
  hideIfBilled() {
    return this.status === Tasks.OneTimePurchase.Status.PENDING ? "" : "hide";
  },
  oneTimePurchases() {
    const task = this;
    return _.map(task.oneTimePurchases, function(otp) {
      return _.extend(otp, { requestorId : task.requestorId });
    })
  },
  toChargeAmount() {
    const otp = Template.instance().oneTimePurchaseToBeCharged.get();
    return otp ? AmountFormatter.toString(otp.totalAmount()) : 0;
  },
  toExtraChargeAmount() {
    const otp = Template.instance().oneTimePurchaseToBeCharged.get();
    return otp ? AmountFormatter.toString(otp.extraCharge()) : 0;
  },
  toChargeItem() {
    const otp = Template.instance().oneTimePurchaseToBeCharged.get();
    return otp ? otp.title : "";
  },
  isCharged() {
    return (this.status !== Tasks.OneTimePurchase.Status.PENDING);
  },

});

Template.assistantTasksDetailOneTimePurchaseForm.events({
  'click i.add': function(e, tmpl) {
    tmpl.isOneTimePurchaseFormShown.set(true);
  },
  'click i.delete' : function() {
    const oneTimePurchaseId = this._id;
    const taskId = this.taskId;
    Tasks.OneTimePurchases.delete(oneTimePurchaseId, taskId);
  },
  "submit form.add" : function(e,tmpl) {
    e.preventDefault();
    return _submitFn(tmpl, e, this._id);
  },
  "keypress form.add input" : function(e, tmpl) {
    if (e.shiftKey && e.keyCode === 13) {
      e.preventDefault();
      $(tmpl.$('form.edit')[0]).submit();
    }
  },
  "keyup form.add input" : function(e) {
    if (e.keyCode === 27) {//esc
      tmpl.isOneTimePurchaseFormShown.set(false);
    }
  },
  "click .one-time-purchase .charge" : function(e, tmpl) {
    tmpl.oneTimePurchaseToBeCharged.set(this);
  },
  "click .charge-confirm-box .charge" : function(e, tmpl) {
    const otpToBeCharged = tmpl.oneTimePurchaseToBeCharged.get();
    const taskId = otpToBeCharged.taskId;
    //to prevent double charged
    Meteor.call('chargeOneTimePurchase', otpToBeCharged, taskId);
    tmpl.oneTimePurchaseToBeCharged.set(null);
  },
  "click .charge-confirm-box .cancel" : function(e, tmpl) {
    tmpl.oneTimePurchaseToBeCharged.set(null);
  }
});

