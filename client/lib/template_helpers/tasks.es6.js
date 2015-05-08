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
        _id: this._id,
        taskId: this._id,
        type: "link",
        message: ref.title,
        url: ref.url
      }
    };
    return _.map(this.references, referenceToMessage);
  },
  totalDurationToMessage() {
    let obj = moment.duration(this.totalDuration());
    return {
      taskId : this._id,
      type   : "time",
      message: obj.humanize()
    };
  },
  taskSchedulerToMessage(taskScheduler) {
    let obj = taskScheduler;
    return {
      type   : "refresh",
      message: obj.toString()
    }
  }
};

TemplateHelpers.Task.SubItem = {
  taskSubItemMessage: function () {
    return this.url ? "taskSubItemMessageWithUrl" : "taskSubItemMessageWithoutUrl";
  }
};
