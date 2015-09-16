Template.assistantTasksDetail.onCreated(function() {
  Template.instance().timer = new ReactiveVar(0);
  Template.instance().timerFn = null;
  Template.instance().rCurrentTaskId = new ReactiveVar();
  Template.instance().showTitleEdit = new ReactiveVar(false);
});

Template.assistantTasksDetail.onRendered(function() {
  let instance = this;
  instance.autorun(function() {
    let task = Template.currentData();
    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    let assistantCurrentTaskStatus = currentAssistant && currentAssistant.currentTask();
    if (assistantCurrentTaskStatus
        && assistantCurrentTaskStatus.status === Assistants.TaskStatus.Stopped
        && assistantCurrentTaskStatus.taskId === task._id
    ) {
      Modal.show('assistantTasksCreateBillable', task);
    } else if (assistantCurrentTaskStatus && assistantCurrentTaskStatus.status === Assistants.TaskStatus.Started) {
      let startedAt = assistantCurrentTaskStatus.startedAt;
      let current = moment().valueOf();
      instance.timer.set(current - startedAt);
    } else {
      Modal.hide();
    }

    instance.rCurrentTaskId.set(task._id);
  });
  if (instance.timer.get() !== 0) {
    let startedAt = Users.findOneAssistant(Meteor.userId()).currentTask().startedAt;
    _updateTimer(instance.timer, startedAt);
    instance.timerFn = Meteor.setInterval(_.partial(_updateTimer, instance.timer, startedAt), 1000);
  }
  instance.$('[data-toggle="tooltip"]').tooltip();
});

Template.assistantTasksDetail.onDestroyed(function() {
  Meteor.clearInterval(this.timerFn);
});

Template.assistantTasksDetail.helpers({
  isTitleEditShown() {
    return Template.instance().showTitleEdit.get();
  },
  timer() {
    return Template.instance().timer.get();
  },
  isWorking() {
    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    return currentAssistant && currentAssistant.currentTask() && currentAssistant.currentTask().taskId === this._id;
  },
  isStartOrPause() {
    if (Users.isAdmin(Meteor.userId())) return 'stop';

    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    let currentTask = currentAssistant && currentAssistant.currentTask();
    return currentTask && currentTask.taskId === this._id ? 'pause' : 'play';
  },
  ifTaskCompleted() {
    return this.isCompleted() ? "completed" : "not-completed";
  },
  getLatestStatus() {
    return this.getLatestStatus(Meteor.userId());
  },
  getRequestorId() {
    return { _id : this.requestorId };
  },
  getCustomerName() {
    let customer = Users.findOneCustomer({ _id : this.requestorId });
    if (customer) { return customer.displayName(); }
  },
  last7DaysTimeUsed() {
    let weekBeforeTimestamp = moment().subtract(7, 'd').valueOf();
    return _.reduce(this.steps, function(memo, step) {
      return memo + step.duration(weekBeforeTimestamp, moment().valueOf());
    }, 0);
  },
  getRCurrentTaskId() {
    return Template.instance().rCurrentTaskId;
  }
});


let _updateTimer = (rTimer, startedAt) => {
  rTimer.set(moment().valueOf() - startedAt);
};

let _stopTimer = (rTimer, timerFn) => {
  rTimer.set(0);
  Meteor.clearInterval(timerFn);
};

Template.assistantTasksDetail.events({
  "click .functions .play": function(e, tmpl) {
    Assistants.startTask(Meteor.userId(), this._id);
    let startedAt = Users.findOneAssistant(Meteor.userId()).currentTask().startedAt;
    _updateTimer(tmpl.timer, startedAt);
    tmpl.timerFn = Meteor.setInterval(_.partial(_updateTimer, tmpl.timer, startedAt), 1000);
  },
  "click .functions .pause": function(e, tmpl) {
    Assistants.endTask(Meteor.userId(), this._id);
    Meteor.clearInterval(tmpl.timerFn);
  },
  'click .functions .complete' : function(e) {
    Tasks.complete(this._id);
  },
  'click .functions .edit' : function(e, tmpl) {
    tmpl.showTitleEdit.set(true);
  },
  'keyup .title-bar [name="title"]' : function(e, tmpl) {
    if (e.keyCode === 27) {
      tmpl.showTitleEdit.set(false);
    }
  },
  'submit #title-edit' : function(e, tmpl) {
    e.preventDefault();
    let newTitle = tmpl.$('.title-bar input[name="title"]').val();
    let edit = Tasks.editTitle(this._id, newTitle);
    if (edit) {
      tmpl.showTitleEdit.set(false);
      return true;
    } else {
      return false;
    }
  }
});
