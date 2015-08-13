AssistantTasksAddStepBankTime = ReactMeteor.createClass({
  templateName : "assistantTasksAddStepBankTime",
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
        <div className='add-step-component'>
          <AssistantTasksAddStepForm ref='assistantTasksAddStepForm' taskId={ this.props.taskId }/>
          <div className="add-step">
            <span onClick={ this.handleOpenClick }
                  data-toggle="tooltip"
                  data-placement="right"
                  title="Actions will be shown on invoice!">+ Add Action</span>
          </div>
        </div>
    );
  },
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }
});
