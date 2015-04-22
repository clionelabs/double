Template.assistantTask.readyFocusTask = () => {
  return _.extend(
      Template.assistantDashboardCustomerTab.getCurrentTask(),
      { isCurrent : true });
};

Template.assistantTask.onRendered(function() {
  if (Template.assistantDashboardCustomerTab.getCurrentTask().isWorking()) {
    Modal.show("currentTask", Template.assistantTask.readyFocusTask);
  }
});
Template.assistantTask.helpers({
  isStartOrPause : function() {
    return this.isWorking() ? 'Pause' : 'Start');
  },
  statusToMessage : function() {
    let obj = this.getLatestStatus();
    let createdTillNow = moment().subtract(moment(obj.createdAt));
    return {
      type: "comment",
      message: obj.message + ". " + moment.duration(createdTillNow).humanize() + " ago. "
    };
  },
  referenceToMessage : function(ref) {
    return {
      type : "link",
      message: ref.title,
      url : ref.url
    }
  },
  deadlineToMessage : function(deadline) {
    let obj = moment(deadline);
    return {
      type: "time",
      message: obj.format("MMM DD, YYYY")
    };
  },
  taskSchedulerToMessage : function(taskScheduler) {
    let obj = taskScheduler;
    return {
      type: "refresh",
      message: obj.toString()
    }
  }
});

Template.assistantTask.events({
  "click .comment" : function() {
    Session.set(SessionKeys.genStatusFormKey(this._id, this.isCurrent), true);
    $('.status-form .status-message').focus();
  },
  "click button.start": function() {
    Tasks.startWork(this._id);
    Session.set(SessionKeys.currentTask, this._id);
    //Use function of reactive-ness Blaze.renderWithData
    Modal.show("currentTask", Template.assistantTask.readyFocusTask);
  },
  "click button.pause": function() {
    Tasks.endWork(this._id);
    Modal.hide("currentTask");
  }
});

Template.assistantTaskStatusForm._submitFn = (e, taskId, isCurrent) => {
  let selector = '[data-id="'+ taskId + '"]';
  selector = isCurrent ? selector + '[data-is-current="' + isCurrent + '"]' : selector;
  selector = selector + " input.status-message";
  let messageInput = $(selector);
  let message = messageInput.val();
  Tasks.Status.change(message, taskId,
      () => {
        messageInput.val("");
        Session.set(SessionKeys.genStatusFormKey(taskId, isCurrent), false);
      });
};

Template.assistantTaskStatusForm.helpers({
  isStatusFormShown : function() {
    return Session.get(SessionKeys.genStatusFormKey(this._id, this.isCurrent)) ? "" : "not-shown";
  }
});

Template.assistantTaskStatusForm.events({
  "click .submit" : function(e) {
    return Template.assistantTaskStatusForm._submitFn(e, this._id, this.isCurrent);
  },
  "keyup input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.set(SessionKeys.genStatusFormKey(this._id, this.isCurrent), false);
    } else if (e.keyCode === 13) {
      Template.assistantTaskStatusForm._submitFn(e, this._id, this.isCurrent);
    }
  }
});

Template.assistantTaskSubItem.helpers({
  assistantTaskSubItemMessage : function() {
    return this.url ? "assistantTaskSubItemMessageWithUrl" : "assistantTaskSubItemMessageWithoutUrl" ;
  }
});
