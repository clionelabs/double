Template.invoiceCreate.onCreated(function() {

  this.from = new ReactiveVar(moment().subtract(7, 'd').valueOf());
  this.to = new ReactiveVar(moment().valueOf());
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
    let to = tmpl.to.get();
    let customer = Template.currentData().customer;
    let tasks = Tasks.find({ requestorId : customer._id }).fetch();

    let invoiceId = Invoices.insert(Invoice.convertFromTasks(from, to, tasks, customer._id), (err, invoiceId) => {
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


