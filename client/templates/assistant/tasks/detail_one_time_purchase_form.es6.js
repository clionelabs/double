let _submitFn = (tmpl, form, taskId) => {
  let date = moment(form.target.date.value).valueOf();
  let title = form.target.title.value;
  let amount = Number.parseFloat(form.target.amount.value);
  let isOnBehalf = form.target.isOnBehalf.checked;
  Tasks.OneTimePurchase.add(date, amount, title, isOnBehalf, taskId,
      () => {
        tmpl.isOneTimePurchaseFormShown.set(false);
      });
};

Template.assistantTasksDetailOneTimePurchaseForm.onCreated(function() {
  _.extend(this,
      {
        isOneTimePurchaseFormShown : new ReactiveVar(false)
      });
});

Template.assistantTasksDetailOneTimePurchaseForm.helpers({
  isOneTimePurchaseFormShown() {
    return Template.instance().isOneTimePurchaseFormShown.get() ? "" : "hide";
  },
  today() {
    return moment().valueOf();
  }
  /*
  TODO add backed when there is last Bill Date for user
  isBilledStr() {
    return this.billedAt ? "billed" : "unbilled";
  },
  hideIfBilled() {
    return this.billedAt ? "hide" : "";
  }
  */
});

Template.assistantTasksDetailOneTimePurchaseForm.events({
  'click i.add': function(e, tmpl) {
    tmpl.isOneTimePurchaseFormShown.set(true);
  },
  'click i.delete' : function() {
    let oneTimePurchaseId = this._id;
    let taskId = Template.parentData().currentTask._id;
    Tasks.OneTimePurchase.delete(oneTimePurchaseId, taskId);
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
  }
});

