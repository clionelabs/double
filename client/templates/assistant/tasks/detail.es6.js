Template.assistantTasksDetail.onCreated(function() {
  Template.instance().timer = new ReactiveVar(0);
  Template.instance().timerFn = null;
});

Template.assistantTasksDetail.helpers({
  timer() {
    return Template.instance().timer.get();
  },
  isWorking() {
    let currentAssistant = Users.findOneAssistant(Meteor.userId());
    return currentAssistant && currentAssistant.currentTask() && currentAssistant.currentTask().taskId === this._id;
  },
  isStartOrPause() {
    if (Users.isAdmin(Meteor.userId())) return 'fa-stop';

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
  getCustomerName() {
    let customer = Users.findOneCustomer({ _id : this.requestorId });
    if (customer) { return customer.displayName(); }
  },
  last7DaysTimeUsed() {
    let weekBeforeTimestamp = moment().subtract(7, 'd').valueOf();
    return _.reduce(this.steps, function(memo, step) {
      return memo + step.duration(weekBeforeTimestamp, moment().valueOf());
    }, 0);
  }
});


let _updateTimer = (rTimer) => {
  rTimer.set(rTimer.get() + 1000);
};

let _stopTimer = (rTimer, timerFn) => {
  rTimer.set(0);
  Meteor.clearInterval(timerFn);
};

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
    } else {
      Modal.hide();
    }

  });
});

Template.assistantTasksDetail.events({
  "click .play": function(e, tmpl) {
    Assistants.startTask(Meteor.userId(), this._id);
    _updateTimer(tmpl.timer);
    tmpl.timerFn = Meteor.setInterval(_.partial(_updateTimer, tmpl.timer), 1000);
  },
  "click .pause": function(e, tmpl) {
    Assistants.endTask(Meteor.userId(), this._id);
    Meteor.clearInterval(tmpl.timerFn);
  },
  'click .complete' : function(e) {
    Tasks.complete(this._id);
  }
});
