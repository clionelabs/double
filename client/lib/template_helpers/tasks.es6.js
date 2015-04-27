TemplateHelpers.Task = {};

TemplateHelpers.Task.Message = {
  checkedIfTaskCompleted : function() {
    return this.isCompleted() ? "glyphicon-ok" : "glyphicon-unchecked";
  },
  statusToMessage       : function () {
    let obj = this.getLatestStatus();
    let createdTillNow = obj.createdAt - moment().valueOf();
    return {
      type   : "comment",
      message: obj.message + ". " + moment.duration(createdTillNow).humanize(true)
    };
  },
  referenceToMessage    : function (ref) {
    console.log(ref);
    return {
      type   : "link",
      message: ref.title,
      url    : ref.url
    }
  },
  deadlineToMessage     : function (deadline) {
    let obj = moment(deadline);
    return {
      type   : "time",
      message: obj.format("MMM DD, YYYY")
    };
  },
  taskSchedulerToMessage: function (taskScheduler) {
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
