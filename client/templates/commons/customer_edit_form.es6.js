Template.customerEditForm.events({
  "submit #customer-form": function (event) {
    event.preventDefault();

    const isEdit = !!this._id;

    const form = event.target;
    const data = {
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      hourlyRate : form.hourlyRate.value,
      creditMs : DurationConverter.minutesToMs(form.creditMs.value),
      planId : form.plan.value,
      billingEmail : form['billing-email'].value
    };

    if (!isEdit) {
      _.extend(data, { email: form.email.value });
    }

    let cb = function(error, result) {
      if (!error) {
        Modal.hide();
      } else {
        Notifications.error(`${error.message}. Please try again.`, '');
      }
    };
    if (isEdit) {
      Meteor.call('editCustomer', this._id, data, cb);
    } else {
      Meteor.call('createCustomer', data, cb);
    }
  },
  "click .select-plan a" : function(event, tmpl) {
    tmpl.selectedPlanName.set(this.name);
    $('select[name="plan"]').val(this._id);
  }
});

Template.customerEditForm.onCreated(function() {
  const instance = this;
  instance.selectedPlanName = new ReactiveVar('');
  instance.autorun(function() {
    if (instance.data) {
      instance.selectedPlanName.set(instance.data.currentPlan().name);
    }
  })
});

Template.customerEditForm.helpers({
  getEmail() {
    return this.emails ? this.emails[0].address : null;
  },
  disabledIfEdit() {
    return this._id ? "disable" : "";
  },
  plans() {
    const plans = Plans.find().fetch();
    plans.push(Plans.NoPlan);
    const userId = this._id;
    const currentSubscription = Users.findOneCustomer(userId).currentSubscription();
    return _.map(plans, function(plan) {
      return _.extend({}, { isSelected : currentSubscription && currentSubscription.planId === plan._id }, plan);
    });
  },
  getCurrentPlanName() {
    return Template.instance().selectedPlanName.get();
  },
  mySubscriptions() {
    return _.map(this.subscriptions(), function(sub) {
      return _.extend({}, { name : sub.plan().name }, sub);
    });
  },
  nextAt() {
    return this.nextCycleAt();
  }
});
