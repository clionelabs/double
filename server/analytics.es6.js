mixpanel = null;

Analytics = {
  bankTimeInMinutes(task, durationInMs) {
    if (!mixpanel) return;
    let properties = {
      distinct_id : task.requestorId,
      taskId : task._id,
      taskTitle : task.title,
      minutesAdded : Math.ceil(durationInMs / 1000 / 60)
    };
    mixpanel.track('Bank Time', properties);
  },
  createRequest(task) {
    if (!mixpanel) return;
    let properties = {
      distinct_id: task.requestorId,
      taskId: task._id,
      taskTitle: task.title,
    };
    mixpanel.track('Create Request', properties);
  },
  increaseRevenue(invoice) {
    if (!mixpanel) return;
    mixpanel.people.track_charge(
      invoice.customerId,
      invoice.revenue(),
      { '$time' : moment(invoice.to).format('YYYY-MM-DDTHH:mm:ss')});
  }
};

Meteor.startup(function() {
  Mixpanel = Meteor.npmRequire('mixpanel');
  mixpanel = Mixpanel.init(Meteor.settings.mixpanel.token);
});

var init = false; //_suppress_initial
Invoices.find({ 'status' : 'charged' }).observe({
  added(invoice) {
    if (init) {
      Analytics.increaseRevenue(invoice)
    }
  }
});

var serverSessionStartAt = moment().valueOf();
Tasks.find({ createdAt : { $gt : serverSessionStartAt } }).observe({
  added(task) {
    if (init) {
      Analytics.createRequest(task);
    }
  }
});

init = true;

Tasks.find({ completedAt : null }).observe({
  changed(newTask, oldTask) {
    if (!_.isEqual(newTask.steps, oldTask.steps)) {
      _bankTimeInMixpanel(newTask, oldTask);
    }
  }
});

var _bankTimeInMixpanel = function(newTask, oldTask) {
  _.each(newTask.steps, function(newStep) {
    _.each(oldTask.steps, function (oldStep) {
      if (_.isEqual(newStep._id, oldStep._id)) {
        const newDurations = newStep.durations;
        const oldDurations = oldStep.durations;
        const newDurationIds = _.pluck(newDurations, '_id');
        const oldDurationIds = _.pluck(oldDurations, '_id');

        // added durations
        _.each(newDurations, function(duration) {
          if (_.indexOf(oldDurationIds, duration._id) === -1) {
            Analytics.bankTimeInMinutes(task, duration.value);
          }
        });

        // deleted durations
        _.each(oldDurations, function(duration) {
          if (_.indexOf(newDurationIds, duration._id) === -1) {
            Analytics.bankTimeInMinutes(task, -duration.value);
          }
        });

      }
    });
  });
};
