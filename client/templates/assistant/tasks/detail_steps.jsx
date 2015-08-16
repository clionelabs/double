AssistantTasksDetailStep = ReactMeteor.createClass({
  templateName : "assistantTasksDetailStep",

  getInitialState() {
    return {
      titleToBe : this.props.step.text,
      isEditing : false
    }
  },
  getMeteorState() {
    var task = Tasks.find(this.props.step.taskId).fetch()[0];
    var step = task.steps.filter(function(step) {
      return step._id === this.props.step._id;
    }.bind(this))[0];
    return _.extend(step, { taskId : task._id });
  },
  isCompletedCheckbox() {
    return this.props.step.isCompleted ? "fa-check-square-o" : "fa-square-o";
  },
  handleActionTitleOnClick(e) {
    this.setState({ isEditing : true });
  },
  handleInputOnKeyup(e) {
    if (e.keyCode === 27) {//esc
      this.setState({ isEditing : false , titleToBe : this.state.text });
    }
  },
  handleInputOnChange(e) {
    this.setState({ titleToBe : e.target.value });
  },
  handleEditFormSubmit(e) {
    e.preventDefault();
    var step = this.props.step;
    Tasks.Steps.editTitle(step.taskId, step._id, this.state.titleToBe, function() {
      this.setState({ isEditing : false });
    }.bind(this));
  },
  handleCheckClick(e) {
    Tasks.Steps.toggleComplete(this.state.taskId, this.state._id);
  },
  handleDeleteClick(e) {
    Tasks.Steps.delete(this.state.taskId, this.state._id);
  },
  handleDurationClick() {
    Modal.show('assistantTasksTimeSheetEdit', this.state);
  },
  render() {
    var deleteButton;
    if (this.props.step.duration() === 0) {
      deleteButton = <i className="fa fa-remove delete"
                        onClick={ this.handleDeleteClick }
          ></i>;
    }
    return (
        <div className="step">
          <i className={ "fa " + this.isCompletedCheckbox() + " check" }
             onClick={ this.handleCheckClick }
              ></i>
          <span className={ 'action-title ' + (this.state.isEditing ? "hide" : "") }
                data-toggle="tooltip"
                data-placement="top"
                title="Click to edit action title"
                onClick={ this.handleActionTitleOnClick }>
            { this.state.text }<i className='fa fa-pencil edit'></i></span>
          <form className={ 'edit-action-title ' + (this.state.isEditing ? "" : "hide") }
                onSubmit={ this.handleEditFormSubmit }
              >
            <input type='text'
                   className="edit-title"
                   onKeyUp={ this.handleInputOnKeyup }
                   onChange={ this.handleInputOnChange }
                   value={ this.state.titleToBe }/>
            <button action='submit'><i className="fa fa-check"></i></button>
          </form>
          &nbsp;|&nbsp;
          <span className='duration'
                data-toggle="tooltip"
                data-placement="top"
                title="Click to edit banked time"
                onClick={ this.handleDurationClick }
            >

            { DurationFormatter.toPreciseString(this.state.duration()) }</span>
          { deleteButton }
        </div>
    );
  }
});

