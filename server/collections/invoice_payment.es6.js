InvoicePayment = {
  _slackLog: (message) => {

    SlackLog.log('_invoices', {
      text: message,
      username: 'Double A.I. Parts 2',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });
  },
  events: [
    {name: 'invoiceIssued', from: 'draft', to: 'issued'},
    {name: 'transactionSucceed', from: 'issued', to: 'charged'},
    {name: 'transactionFailed', from: 'issued', to: 'failed'},
    {name: 'transactionVoided', from: 'issued', to: 'voided'}
  ],
  _attachStateMachine(invoice) {
    let initialState = 'none';
    if (invoice.status) {
      initialState = invoice.status;
    }
    let stateMachine = StateMachine.create({
      initial: {state: initialState, event: 'init', defer: true},
      error: function (eventName, from, to, args, errorCode, errorMessage) {
        let error = '[InvoicesPayment] event ' + eventName + ' was naughty :- ' + errorMessage;
        console.log(error);
        return error;
      },
      events: this.events,
      callbacks: {
        onenterstate: function (event, from, to) {
          if (from === 'none') return;
          let invoice = this;
          let i = Invoices.update(invoice._id, {$set: {'status': to}});
        },
        oninvoiceIssued(event, from, to) {
          let invoice = this;
          console.log(`[Invoice] InvoiceId ${invoice._id} issued.`);
          let data = {
            invoiceId: invoice._id,
            customerId: invoice.customerId,
            amount: accounting.toFixed(invoice.revenue(), 2),
            type: Transaction.Type.INVOICE
          };
          const customer = Users.findOneCustomer(invoice.customerId);
          D.Events.create('newTransaction', data); // call double.pay to create a transaction
          InvoicePayment._slackLog(`
          ${customer.displayName()}'s invoice
from ${DateFormatter.toDateStringWithTimeZone(invoice.from, customer.timezone())}
to ${DateFormatter.toDateStringWithTimeZone(invoice.to, customer.timezone())}
has been issued.
          `);
        },
        ontransactionSucceed: function (event, from, to) {
          let chargedInvoice = this;
          console.log(`[Invoice] InvoiceId ${chargedInvoice._id} transaction succeed.`);
          const msToBeDeduct = _.max([0, chargedInvoice.roundedInSecondTotalDuration() - chargedInvoice.creditFromSubscription]);
          Customers.deductCreditMs(chargedInvoice.customerId, msToBeDeduct);
          Invoices.generateToken(chargedInvoice._id);
          //Email is sent after the token is generated
          const customer = Users.findOneCustomer(chargedInvoice.customerId);
          InvoicePayment._slackLog(`
${customer.displayName()}'s invoice
from ${DateFormatter.toDateStringWithTimeZone(chargedInvoice.from, customer.timezone())}
to ${DateFormatter.toDateStringWithTimeZone(chargedInvoice.to, customer.timezone())}
has been charged and an Email has been sent.
`);
        },
        ontransactionFailed: function (event, from, to) {
          const failedInvoice = this;
          console.log(`[Invoice] InvoiceId ${failedInvoice._id} transaction failed.`);
          const customer = Users.findOneCustomer(failedInvoice.customerId);
          const url = Router.routes['assistant.customers.invoices.selected'].url({
            customerId: failedInvoice.customerId,
            invoiceId: failedInvoice._id
          });
          InvoicePayment._slackLog(`
INSPECTION REQUIRED:<!channel>
${customer.displayName()}'s invoice
from ${DateFormatter.toDateStringWithTimeZone(failedInvoice.from, customer.timezone())}
to ${DateFormatter.toDateStringWithTimeZone(failedInvoice.to, customer.timezone())}
has failed for some reason.
Link here: ${url}
`);
        },
        ontransactionVoided: function (event, from, to) {
          const voidedInvoice = this;
          console.log(`[Invoice] InvoiceId ${voidedInvoice._id} transaction voided.`);
          const customer = Users.findOneCustomer(voidedInvoice.customerId);
          InvoicePayment._slackLog(`
${customer.displayName()}'s invoice
from ${DateFormatter.toDateStringWithTimeZone(voidedInvoice.from, customer.timezone())}
to ${DateFormatter.toDateStringWithTimeZone(voidedInvoice.to, customer.timezone())}
has been voided.
`);
        }
      }
    });
    _.extend(invoice, stateMachine);
    invoice.init();
    return invoice;
  },
  issueInvoice(invoiceId) {
    this._attachStateMachine(Invoices.findOne(invoiceId)).invoiceIssued();
    return invoiceId;
  },
  onSucceed(invoiceId) {
    this._attachStateMachine(Invoices.findOne(invoiceId)).transactionSucceed();
    return invoiceId;
  },
  onFailed(invoiceId) {
    this._attachStateMachine(Invoices.findOne(invoiceId)).transactionFailed();
    return invoiceId;
  },
  onVoided(invoiceId) {
    this._attachStateMachine(Invoices.findOne(invoiceId)).transactionVoided();
    return invoiceId;
  },
  startup: () => {
    // Listen to transactions events
    D.Events.listen('transactionSuccess', function (data) {
      try {
        if (data.type !== Transaction.Type.INVOICE) return false;
        let invoiceId = data.invoiceId;
        InvoicePayment.onSucceed(invoiceId);
        return true;
      } catch (ex) {
        console.error('[Transactions] Error in invoice transaction success: ', ex);
        return false;
      }
    });

    D.Events.listen('transactionFailure', function (data) {
      try {
        if (data.type !== Transaction.Type.INVOICE) return false;
        let invoiceId = data.invoiceId;
        InvoicePayment.onFailed(invoiceId);
        return true;
      } catch (ex) {
        console.error('[Transactions] Error in invoice transaction fail: ', ex);
        return false;
      }
    });

    D.Events.listen('transactionVoid', function (data) {
      try {
        if (data.type !== Transaction.Type.INVOICE) return false;
        let invoiceId = data.invoiceId;
        InvoicePayment.onVoided(invoiceId);
        return true;
      } catch (ex) {
        console.error('[Transactions] Error in invoice transaction void: ', ex);
        return false;
      }
    });
    let init = false;
    Invoices.find({'status': Invoice.Status.Charged, 'token': {$exists: true}}).observe({
      added(newInvoice) {
        if (!init) return;

        if (newInvoice.revenue()) {
          Invoices.sendEmail(newInvoice);
        }
      }
    });
    init = true;
  }
};
