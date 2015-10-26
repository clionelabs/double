mixpanel = null;

Analytics = {
  bankTimeInMinutes(task, durationInMs) {
    if (!mixpanel) return;
    console.log(`[Analytics] Task ${task._id} is banked ${durationInMs} in mixpanel.`);
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
    console.log(`[Analytics] Task ${task._id} is created in mixpanel.`);
    let properties = {
      distinct_id: task.requestorId,
      taskId: task._id,
      taskTitle: task.title,
    };
    mixpanel.track('Create Request', properties);
  },
  increaseRevenue(invoice) {
    if (!mixpanel) return;
    console.log(`[Analytics] Invoice ${invoice._id} is charged in mixpanel.`);
    mixpanel.people.track_charge(
      invoice.customerId,
      invoice.revenue(),
      { '$time' : moment(invoice.to).format('YYYY-MM-DDTHH:mm:ss')});
  },
  updateProfile(user) {
    if (!mixpanel) return;
    console.log(`[Analytics] User ${user._id} has been updated in mixpanel.`);
    mixpanel.people.set(user._id, {
      $first_name : user.profile.firstname,
      $last_name : user.profile.lastname,
      $name : user.displayName(),
      $email : user.emails[0].address,
      $created : user.createdAt
    });
  }
};

Meteor.startup(function() {
  if (Meteor.settings.mixpanel && Meteor.settings.mixpanel.token) {
    Mixpanel = Meteor.npmRequire('mixpanel');
    mixpanel = Mixpanel.init(Meteor.settings.mixpanel.token);
  }
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

Users.findCustomers().observe({
  added(user) {
    if (init) {
      Analytics.updateProfile(user);
    }
  },
  changed(user) {
    Analytics.updateProfile(user);
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
            Analytics.bankTimeInMinutes(newTask, duration.value);
          }
        });

        // deleted durations
        _.each(oldDurations, function(duration) {
          if (_.indexOf(newDurationIds, duration._id) === -1) {
            Analytics.bankTimeInMinutes(newTask, -duration.value);
          }
        });

      }
    });
  });
};
