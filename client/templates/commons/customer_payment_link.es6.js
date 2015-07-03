Template.customerPaymentLink.helpers({
  getCustomerPaymentLink() {
    let customer = this;
    if (customer.payment && customer.payment.authURL) {
      return customer.payment.authURL;
    } else {
      return "NOT AVAILABLE"; // normally, it's not supposed to happen
    }
  }
});

Template.customerPaymentLink.onRendered(function(){
  this.$('#customer-payment-link').focus(function() { this.select(); });
});
