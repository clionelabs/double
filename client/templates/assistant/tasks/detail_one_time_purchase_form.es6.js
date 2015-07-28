let _submitFn = (tmpl, form, taskId) => {
  let title = form.target.title.value;
  let amount = Number.parseFloat(form.target.amount.value);
  Tasks.OneTimePurchase.add(amount, title, taskId,
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
  isBilledStr() {
    return this.billedAt ? "billed" : "unbilled";
  },
  hideIfBilled() {
    return this.billedAt ? "hide" : "";
  }
});

Template.assistantTasksDetailOneTimePurchaseForm.events({
  'click i.add': function(e, tmpl) {
    tmpl.isOneTimePurchaseFormShown.set(true);
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

