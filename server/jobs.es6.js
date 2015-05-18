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
