

Template.assistantTask.helpers({
  isStartOrPause : function() {
    return this.isWorking() ? 'Pause' : 'Start';
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
  },
  checkedIfTaskCompleted : function() {
    return this.isCompleted() ? "glyphicon-ok" : "glyphicon-unchecked";
  },
  disabledIfTaskCompleted : function() {
    return this.isCompleted() ? "disabled" : "";
  }
});

Template.assistantTask.events({
  "click .comment" : function() {
    Session.setAuth(SessionKeys.genStatusFormKey(this._id, this.isCurrent), true);
  },
  "click button.start": function() {
    Tasks.startWork(this._id);
  },
  "click button.pause": function() {
    Tasks.endWork(this._id);
  },
  'click .checkbox.glyphicon-unchecked' : function(e) {
    Tasks.completeWork(this._id);
    Modal.hide("currentTask");
    Session.clear(SessionKeys.currentTask);
  }
});

Template.assistantTaskStatusForm._submitFn = (form, taskId, isCurrent) => {
  let message = form.target.message.value;
  Tasks.Status.change(message, taskId,
      () => {
        form.target.reset();
        Session.setAuth(SessionKeys.genStatusFormKey(taskId, isCurrent), false);
      });
};

Template.assistantTaskStatusForm.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.form-container').on('transitionend onanimationend', function(e) {
    if ($(e.target).height() > 1) {
      selfTemplate.$('.status-message').focus();
    }
  });
});

Template.assistantTaskStatusForm.helpers({
  isStatusFormShown : function() {
    return Session.get(SessionKeys.genStatusFormKey(this._id, this.isCurrent)) ? "" : "not-shown";
  },
  genFormKey : function(taskId, isCurrent) {
    return SessionKeys.genStatusFormKey(taskId, isCurrent);
  }
});

Template.assistantTaskStatusForm.events({
  "submit .task-status-change" : function(e) {
    e.preventDefault();
    return Template.assistantTaskStatusForm._submitFn(e, this._id, this.isCurrent);
  },
  "keyup .task-status-change input" : function(e) {
    if (e.keyCode === 27) {//esc
      Session.setAuth(SessionKeys.genStatusFormKey(this._id, this.isCurrent), false);
    }
  }
});

Template.assistantTaskSubItem.helpers({
  assistantTaskSubItemMessage : function() {
    return this.url ? "assistantTaskSubItemMessageWithUrl" : "assistantTaskSubItemMessageWithoutUrl" ;
  }
});
