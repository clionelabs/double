SyncedCron.add({
  name: "generate scheduler next tasks",
  schedule(parser) {
    // return parser.text('every 10 seconds');
    return parser.cron('0 * * * *');
  },
  job() {
    TaskSchedulers.generateAllNextsIfNotExisted();
  }
});

SyncedCron.add({
  name: 'check invoice is settled or not',
  schedule(parser) {
    return parser.cron('*/5 * * * *');
  },
  job() {
    InvoiceScheduler.checkSettled();
  }
});