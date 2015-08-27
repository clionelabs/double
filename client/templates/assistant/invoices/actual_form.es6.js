Template.assistantsInvoiceActualForm.helpers({
  showOneTimePurchases() {
    return (this.oneTimePurchases && this.oneTimePurchases.length)
              ? "assistantsInvoiceActualFormOneTimePurchasesTable" : "";
  },
  showTimeBasedItems() {
    return (this.timeBasedItems && this.timeBasedItems.length)
        ? "assistantsInvoiceActualFormTimeBasedItemsTable" : "";
  },
  showAdjustments() {
    return (this.adjustments && this.adjustments.length)
        ? 'assistantsInvoiceActualFormAdjustmentsTable' : '';
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
        .sortBy('amount')
        .sortBy('title')
        .sortBy('date').value();
  }
});

Template.assistantsInvoiceActualFormAdjustmentsTable.helpers({
  adjustments() {
    let adjustments = this.adjustments;
    return _(adjustments)
        .chain()
        .sortBy('amount')
        .sortBy('reason')
        .sortBy('title')
        .sortBy('date').value();
  }
});
