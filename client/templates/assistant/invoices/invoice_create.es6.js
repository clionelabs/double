Template.invoiceCreate.onRendered(function() {
  let from = Template.currentData().from;
  let to = Template.currentData().to;
  let formatter = UI._globalHelpers['formatDate'];
  this.$('input.from').val(formatter(from.get())).on('blur', function() {
    let fromTs = moment($(this).val(), 'YYYY-MM-DD').valueOf();
    from.set(fromTs);
  });
  this.$('input.to').val(formatter(to.get())).on('blur', function(){
    let toTs = moment($(this).val(), 'YYYY-MM-DD').valueOf();
    to.set(toTs);
  });
});

Template.invoiceCreate.helpers({
  getTasksWithQuery() {
    let tasks = this.tasks.fetch();

    let extendTask = (from, to, task) => {
      return _.extend({
        queryRange : {
          from: from,
          to: to
        }
      }, task);
    };
    return _.map(tasks, _.partial(extendTask, this.from.get(), this.to.get()));
  }
});

Template.invoiceCreate.events({
  "click .generate-draft" : function(e, tmpl) {
    tmpl.$('.loading').removeClass('hide');

    let from = Template.currentData().from.get();
    let to = Template.currentData().to.get();
    let customer = Template.currentData().customer;
    let tasks = Tasks.find({ requestorId : customer._id }).fetch();

    let invoiceId = Invoices.insert(Invoice.convertFromTasks(from, to, tasks, customer._id), (err, invoiceId) => {
      tmpl.$('.loading').addClass('hide');
      Router.go('assistant.customers.invoices.selected', { customerId : customer._id, invoiceId : invoiceId });
      Modal.hide();
    });

  }
});


