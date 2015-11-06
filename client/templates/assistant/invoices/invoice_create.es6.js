Template.invoiceCreate.onCreated(function() {

  const customerId = this.data.customer._id;
  const lastBilledDate = Invoices.findLastBilledDate({ customerId : customerId }) || moment().valueOf();
  const userPlanCycleDuration = Users.findOneCustomer(customerId).currentPlan().cycleDuration();
  this.from = new ReactiveVar(lastBilledDate + 1);
  this.to = new ReactiveVar(moment(lastBilledDate).add(1, 'month').valueOf());
});
Template.invoiceCreate.onRendered(function() {
  let from = this.from;
  let to = this.to;
  let formatter = UI._globalHelpers['formatDate'];
  let fromInput = this.$('input.from');
  let toInput = this.$('input.to');
  fromInput.val(formatter(from.get()));
  toInput.val(formatter(to.get()));

  let customerId = this.data.customer._id;
  this.autorun(function() {
    let lastBilledDate = Invoices.findLastBilledDate({ customerId : customerId });
    if (from.get() < lastBilledDate || to.get() < lastBilledDate) {
      Template.instance().$('.warn').removeClass('hide');
    } else {
      Template.instance().$('.warn').addClass('hide');
    }
  });
});

Template.invoiceCreate.helpers({
  getTasksWithQuery() {
    let tasks = this.tasks.fetch();
    let from = this.from.get();
    let to = this.to.get();

    return _.map(tasks, function(task) {
      return _.extend({}, {
        queryRange : {
          from: from,
          to: to
        }}, task);
    });
  }
});

Template.invoiceCreate.events({
  "click .generate-draft" : function(e, tmpl) {
    tmpl.$('.loading').removeClass('hide');

    let from = tmpl.from.get();
    let to = moment(tmpl.to.get()).endOf('day').valueOf();
    let customer = Template.currentData().customer;

    const invoice = Invoices.Generator.generate(from, to, customer._id);
    Invoices.insert(invoice, (err, invoiceId) => {
      tmpl.$('.loading').addClass('hide');
      Router.go('assistant.customers.invoices.selected', { customerId : customer._id, invoiceId : invoiceId });
      Modal.hide();
    });
  },
  "change input.from" : function(e, tmpl) {
    let fromTs = moment($(e.currentTarget).val()).valueOf();
    tmpl.from.set(fromTs);
  },
  "change input.to" : function(e, tmpl) {
    let toTs = moment($(e.currentTarget).val()).valueOf();
    tmpl.to.set(toTs);
  }

});


