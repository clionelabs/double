Template.customerListItem.onRendered(() => {
  let onDateRangePickerApply = function (customer, start, end, label) {
    Meteor.call('exportTimesheet', start.valueOf(), end.valueOf(), customer._id,
        function (error, result) {

          let triggerDownloadCSV = function (filename, uri) {
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
        format: 'YYYY-MM-DD',
        opens: 'right',
        maxDate: moment()
      },
      _.partial(onDateRangePickerApply, this.data)
  );
});

Template.customerListItem.events({
  "click .profile" : function() {
    Modal.show('customerEditForm', this);
  },
  "click .selector" : function(e, tmpl) {
    Session.set(SessionKeys.CURRENT_CUSTOMER, tmpl.data);
    window.history.pushState({}, tmpl.data._id, `/assistant/customers/${tmpl.data._id}`);
  }
});

Template.customerListItem.helpers({
  tasks() {
    return Tasks.find({ requestorId: this._id }, { sort: { title: 1 }});
  },
  getCurrentTask : Template.assistantDashboardCustomerTab.getCurrentTask,
  animateIfIsCalling() {
    let thisCustomer = _.extend(this, Customer);
    return (thisCustomer.isCalling()) ? "animated infinite wobble" : "";
  },
  isSelected() {
    let currentCustomer = Session.get(SessionKeys.CURRENT_CUSTOMER);
    if (currentCustomer) {
      return _.isEqual(this._id, currentCustomer._id) ? "selected flash animated" : "";
    } else {
      return "";
    }
  }
});
