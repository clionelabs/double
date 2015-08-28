Adjustment = ReactMeteor.createClass({
  handleDeleteClick() {

  },
  render() {
    return (
        <div className='adjustment'>
          <div className='main'>
            <span className='date'>{ DateFormatter.toDateString(this.props.adjustment.createdAt) }</span>
            <span className='reason'>{ this.props.adjustment.reason }</span>
            <span className='duration'>{ DurationFormatter.toPreciseString(this.props.adjustment.duration) }</span>
          </div>
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
            return <Adjustment adjustment={ adjustment } ></Adjustment>;
          })}
        </div>
      </div>

    );
  }
});