SyncedCron.add({
  name: "generate scheduler next tasks",
  schedule: function(parser) {
    // return parser.text('every 10 seconds');
    return parser.cron('0 * * * *');
  },
  job: function() {
    TaskSchedulers.generateNexts();
  }
});
