Template.assistantsInvoiceActualForm.helpers({
  showOneTimePurchases() {
    return (this.oneTimePurchases && this.oneTimePurchases.length)
              ? "assistantsInvoiceActualFormOneTimePurchasesTable" : "";
  },
  showTimeBasedItems() {
    return (this.timeBasedItems && this.timeBasedItems.length)
        ? "assistantsInvoiceActualFormTimeBasedItemsTable" : "";
  },
  debitedOrDue() {
    return this.isCustomerPaymentMethodAvailable ? 'Debited' : 'Due';
  }
});

Template.assistantsInvoiceActualFormTimeBasedItemsTable.helpers({
  timeBasedItems() {
    let timeBasedItems = this.timeBasedItems;
    return _(timeBasedItems)
            .chain()
            .sortBy('totalDuration')
            .sortBy('updates')
            .sortBy('date')
            .sortBy('title').value();
  }
});

Template.assistantsInvoiceActualFormOneTimePurchasesTable.helpers({
  oneTimePurchases() {
    let oneTimePurchases = this.oneTimePurchases;
    return _(oneTimePurchases)
        .chain()
        .sortBy('requests')
        .sortBy('title')
        .sortBy('amount')
        .sortBy('date').value();
  }
});
