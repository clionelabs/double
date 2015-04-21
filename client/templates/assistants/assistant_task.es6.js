Template.assistantTask.helpers({
  statusToMessage : function() {
    let obj = this.getLatestStatus();
    if (!(obj.message || obj.createdAt)) throw "status is malformed";
    let createdTillNow = moment().subtract(moment(obj.createdAt));
    return {
      type: "comment",
      message: obj.message + ". " + moment.duration(createdTillNow).humanize() + " ago. "
    };
  },
  referenceToMessage : function(ref) {
    let obj = ref || this;
    if (!(obj.title || obj.url)) throw "status is malformed";
    return {
      type : "link",
      message: obj.title,
      url : obj.url
    }
  },
  deadlineToMessage : function(deadline) {
    let obj = moment(deadline) || moment(this);
    if (!(deadline.isValid())) throw "deadline is not valid";
    return {
      type: "time",
      message: obj.format("MMM DD, YYYY")
    };
  },
  taskSchedulerToMessage : function(taskScheduler) {
    let obj = taskScheduler || this;
    if (!obj.toString) throw "taskScheduler is not valid";
    return {
      type: "refresh",
      message: obj.toString()
    }
  }
});

Template.assistantTask.events({
  "click .comment" : function() {
    Session.set('isStatusFormShown', true);
    $('.status-form .status-message').focus();
  }
});


Template.assistantTaskStatusForm.helpers({
  isStatusFormShown : function() {
    return Template._toggleTwoClass(Session.get("isStatusFormShown"), "", "not-shown");
  }
});

Template.assistantTaskStatusForm._submitFn = (e) => {
  let taskId = $(e.target).data("id");
  let messageInput = $('input.status-message[data-id="'+ taskId + '"]');
  let message = messageInput.val();
  Tasks.Status.change(message, taskId,
      () => {
        messageInput.val("");
        Session.set('isStatusFormShown', false);
      });
};

Template.assistantTaskStatusForm.events({
  "click .submit" : Template.assistantTaskStatusForm._submitFn,
  "keyup input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.set('isStatusFormShown', false);
    } else if (e.keyCode === 13) {
      Template.assistantTaskStatusForm._submitFn(e);
    }
  }
});

Template.assistantTask.events({
  "click button.start": function() {
    Tasks.startWork(this._id);
  },
  "click button.end": function() {
    Tasks.endWork(this._id);
  }
});

Template.assistantTaskSubItem.helpers({
  assistantTaskSubItemMessage : function() {
    return this.url ? "assistantTaskSubItemMessageWithUrl" : "assistantTaskSubItemMessageWithoutUrl" ;
  }
});
