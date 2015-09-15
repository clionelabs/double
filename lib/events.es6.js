D.Events = new Meteor.Collection('events');

D.Event = {
  Type : {
    PAY_INVOICE : 'pay-invoice',
    CHARGE_INVOICE: 'charge-invoice',
    VOID_INVOICE: 'void-invoice',
    FAIL_INVOICE: 'fail-invoice',
  }
};