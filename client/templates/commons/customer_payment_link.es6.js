Template.customerPaymentLink.helpers({
  getCustomerPaymentLink() {
    //TODO add
    return 'https://www.google.com';
  }
});

Template.customerPaymentLink.onRendered(function(){
  this.$('#customer-payment-link').focus(function() { this.select(); });
});
