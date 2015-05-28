let _getCurrentTaskSelector = {
  $where: function () {
    _.extend(this, Task.Prototype);
    return this.isWorking();
  }
};

Template.assistantDashboardCustomerTab.getCurrentTask = () => {
  return Tasks.findOne(_getCurrentTaskSelector);
};

Template.assistantDashboardCustomerTab.onRendered(function() {
  Tasks.find(_getCurrentTaskSelector).observe({
    added(task) {
      //Modal.show need a function argument to be reactive #gotcha
      Modal.show("currentTask", Template.assistantDashboardCustomerTab.getCurrentTask);
    },
    removed() {
      Modal.hide("currentTask");
    }
  });

  let onDateRangePickerApply = function(customer, start, end, label) {
    Meteor.call('exportTimesheet', start.valueOf(), end.valueOf(), customer._id,
        function(error, result) {

          let triggerDownloadCSV = function(filename, uri) {
            // window.open has ugly filename. use this hacky method to allow customizing filename
            var link = document.createElement('a');
            if (typeof link.download === 'string') {
              document.body.appendChild(link); // Firefox requires the link to be in the body
              link.download = filename;
              link.href = uri;
              link.click();
              document.body.removeChild(link); // remove the link when done
            } else {
              location.replace(uri);
            }
          };

          if (error) {
            Notifications.error('Export CSV', 'Export CSV failed -- ' + error + ' --');
          } else {
            let uri = "data:text/csv;charset=utf-8," + escape(result);

            let startPart = start.format('YYYY-MM-DD');
            let endPart = end.format('YYYY-MM-DD');
            let filename = `${customer.displayName()}_${startPart}_${endPart}.csv`;

            triggerDownloadCSV(filename, uri);
          }
        }
    );
  };

  this.$('.export').daterangepicker(
      {
        format : 'YYYY-MM-DD',
        opens : 'right',
        maxDate : moment()
      },
      _.partial(onDateRangePickerApply, this.data)
  );
});

Template.assistantDashboardCustomerTab.helpers({
  tasks() {
    return Tasks.find({requestorId: this._id}, {sort: {title: 1}});
  },
  getCurrentTask : Template.assistantDashboardCustomerTab.getCurrentTask,
  animateIfIsCalling() {
    let thisCustomer = _.extend(this, Customer);
    return (thisCustomer.isCalling()) ? "animated infinite wobble" : "";
  },
  isSelected() {
    let currentCustomer = Session.get(SessionKeys.CURRENT_CUSTOMER);
    if (currentCustomer) {
      return _.isEqual(this._id, currentCustomer._id) ? "selected rubberband animated" : "";
    } else {
      return "";
    }
  }
});

Template.assistantDashboardCustomerTab.events({
  "click .new-task-button": function() {
    let data = {
      customerId: this._id
    };
    Modal.show('assistantCreateTask', data);
  },
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "click .new-task-scheduler-button": function() {
    let data = {
      customerId: this._id
    };
    Modal.show('assistantCreateTaskSchedule', data);
  },
  "click .selector" : function(e, tmpl) {
    Session.set(SessionKeys.CURRENT_CUSTOMER, tmpl.data);
  }
});

Template.assistantDashboardCustomerTab._submitPreferenceFn = (form, taskId, isCurrent) => {
  let message = form.target.message.value;
  Tasks.Status.change(message, taskId,
      () => {
        form.target.reset();
        Session.setAuth(SessionKeys.genStatusFormKey(taskId, isCurrent), false);
      });
};

