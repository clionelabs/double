Adjustment = ReactMeteor.createClass({
  handleDeleteClick() {
    var taskId = this.props.taskId;
    var adjustment = this.props.adjustment;
    Analytics.bankTimeInMinutes(
        Tasks.findOne(taskId),
        Meteor.userId(),
        moment.duration(-adjustment.duration));
    Tasks.Adjustments.delete(adjustment._id, taskId);
  },
  hideIfOverAnHourAgo() {
    return moment().valueOf() - this.props.adjustment.createdAt > moment.duration(1, 'hours').valueOf() ? "hide" : "";
  },
  render() {
    return (
        <div className='adjustment'>
          <div className='main'>
            <span className='date'>{ DateFormatter.toDateString(this.props.adjustment.createdAt) }</span>
            <span className='reason'>{ this.props.adjustment.reason }</span>
            <span className='duration'>{ DurationFormatter.toPreciseString(this.props.adjustment.duration) }</span>
          </div>
          <i className={ this.hideIfOverAnHourAgo() + ' delete fa fa-remove' } onClick={ this.handleDeleteClick }></i>
        </div>
    )
  }
});

Adjustments = ReactMeteor.createClass({
  templateName : "assistantTasksDetailAdjustments",
  getInitialState() {
    return {
      isAdding: false
    }
  },
  getMeteorState() {
    var taskId = this.props.rCurrentTaskId.get();
    return {
      task : Tasks.findOne(taskId) || {}
    }
  },
  handleOnAddClick() {
    this.toggle();
    return true;
  },
  handleAddAdjustSubmit(e) {
    e.preventDefault();
    var reason = e.target.reason.value;
    var duration = moment.duration(e.target.duration.value);
    var ui = this;
    var form = e.target.reset();
    var task = this.state.task;
    Analytics.bankTimeInMinutes(task, Meteor.userId(), duration, reason);
    Tasks.Adjustments.add(reason, duration.valueOf(), this.state.task._id, function() {
      ui.toggle();
    });
  },
  handleInputKeyUp(e) {
    var ui = this;
    if (e.keyCode === 27 ) {
      e.preventDefault();
      e.target.value = "";
      ui.toggle();
    } else {
    }
  },
  toggle() {
    this.setState({ isAdding : !this.state.isAdding })
  },
  render() {
    var state = this.state;
    return (
      <div className='adjustments'>
        <h4>Adjustments<i className='fa fa-plus add' onClick={ this.handleOnAddClick }></i></h4>
        <form className={ this.state.isAdding ? "" : "hide" }
              id='add-adjustment'
              onSubmit={ this.handleAddAdjustSubmit }>
          <label htmlFor='reason'>Reason</label>
          <input onKeyUp={ this.handleInputKeyUp } name='reason' type='text'/>
          <label htmlFor='duration'>Duration</label>
          <input onKeyUp={ this.handleInputKeyUp } name='duration' placeholder='00:00:00' type='text' />
          <button type='submit'>Add</button>
        </form>
        <div className='adjustments-list'>
          { _.map(this.state.task.adjustments, function(adjustment) {
            return <Adjustment adjustment={ adjustment } taskId={ state.task._id } key={ adjustment._id }></Adjustment>;
          })}
        </div>
      </div>

    );
  }
});