Template.currentTask.onCreated(function() {
  this.data = _.extend(
      this.data,
      { isCurrent : true });
});
