TemplateHelpers.Task = {};

TemplateHelpers.Task.Message = {
  checkedIfTaskCompleted() {
    return this.isCompleted() ? "glyphicon-ok" : "glyphicon-unchecked";
  },
  statusToMessage() {
    let obj = this.getLatestStatus();
    let createdTillNow = obj.createdAt - moment().valueOf();
    return {
      type   : "comment",
      message: obj.message + ". " + moment.duration(createdTillNow).humanize(true)
    };
  },
  referencesToMessage() {
    let referenceToMessage = (ref) => {
      return {
        _id: ref._id,
        taskId: this._id,
        type: "link",
        message: ref.title,
        url: ref.url
      };
    };
    return _.map(this.references, referenceToMessage);
  },
  totalDurationToMessage() {
    let obj = moment.duration(this.totalDuration());
    return {
      taskId : this._id,
      type   : "time",
      message: obj.format('HH [hr] mm [min] ss [sec]')
    };
  },
  taskSchedulerToMessage(taskScheduler) {
    return {
      type   : "refresh",
      message: taskScheduler.toString()
    };
  }
};

TemplateHelpers.Task.SubItem = {
  taskSubItemMessage: function () {
    return this.url ? "taskSubItemMessageWithUrl" : "taskSubItemMessageWithoutUrl";
  }
};
