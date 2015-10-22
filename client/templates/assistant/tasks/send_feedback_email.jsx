AssistantTaskSendFeedbackEmail = ReactMeteor.createClass({
  templateName : 'assistantTasksSendFeedbackEmail',
  getMeteorState() {
   const task = Tasks.findOne(this.props.rTaskId.get());
    if (task) {
      return {
        customer: Users.findOneCustomer(task.requestorId),
        task: task
      };
    } else {
      return {};
    }
  },
  printHaveSendFeedbackEmail() {
    const task = this.state.task;
    const customer = this.state.customer;
    if(customer.lastFeedbackEmailSendAt()) {
      const lastFeedbackEmailDateString = DateFormatter.toDateString(customer.lastFeedbackEmailSendAt());
      return ` sent a feedback email on ${lastFeedbackEmailDateString}`;
    } else {
      return ' never sent a feedback email.';
    }
  },
  handleOnYesClick() {
    const task = this.state.task;
    const customer = this.state.customer;
    Feedbacks.insert({
      taskId : task._id,
      customerId : customer._id,
      isSent : false
    }, function() {
      $('#send-feedback-email').modal('hide');
    });
  },
  render() {
    const task = this.state.task;
    const customer = this.state.customer;
    if (!task || !customer) { return (<div></div>); }
    return (
      <div className='modal fade' id='send-feedback-email'>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">Email</h4>
            </div>
            <div className="modal-body">
              <p>
                Do you want to send a feedback email regarding { task.title } to { customer.displayName() }?<br/>
                We have
                { this.printHaveSendFeedbackEmail() }
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary yes" onClick={ this.handleOnYesClick}>Why not?</button>
              <button type="button" className="btn btn-default no" data-dismiss="modal">We need no feedback</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});