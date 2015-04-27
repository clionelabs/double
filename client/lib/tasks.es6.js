TemplateHelper = {};

TemplateHelper.Task = {};

TemplateHelper.Task.Message = {
  checkedIfTaskCompleted : function() {
    return this.isCompleted() ? "glyphicon-ok" : "glyphicon-unchecked";
  },
  statusToMessage       : function () {
    let obj = this.getLatestStatus();
    let createdTillNow = moment().subtract(moment(obj.createdAt));
    return {
      type   : "comment",
      message: obj.message + ". " + moment.duration(createdTillNow).humanize() + " ago. "
    };
  },
  referenceToMessage    : function (ref) {
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

TemplateHelper.Task.SubItem = {
  taskSubItemMessage: function () {
    return this.url ? "taskSubItemMessageWithUrl" : "taskSubItemMessageWithoutUrl";
  }
};
