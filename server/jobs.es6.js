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
  name: "[Cron] Generate invoice for today",
  schedule(parser) {
    return parser.cron('0 1 * * *');
  },
  job() {
    const today = moment().valueOf();
    Invoices.Generator.generateForUsersDue(today);
  }
});
