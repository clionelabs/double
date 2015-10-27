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
  name: '[Cron] Recharge Credit for monthly subscription',
  schedule(parser) {
    return parser.cron('58,59 23 * * *')
  },
  job() {
    Plans.rechargeMonthly();
  }
});