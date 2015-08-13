AssistantTasksAddStep = ReactMeteor.createClass({
  templateName : "assistantTasksAddStep",
  getInitialState() {
    return {
      isFormShown : false
    };
  },
  handleOpenClick() {
    this.refs.assistantTasksAddStepForm.toggle();
  },
  render() {
    return (
      <div className='assistant-tasks-add-step'>
      <h4>Actions <i className="fa fa-plus" onClick={ this.handleOpenClick }></i></h4>
      <AssistantTasksAddStepForm ref='assistantTasksAddStepForm' taskId={ this.props.taskId }/>
      </div>
    );
  }
});