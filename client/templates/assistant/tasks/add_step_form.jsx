AssistantTasksAddStepForm = ReactMeteor.createClass({
  getInitialState() {
    return {
      isShown : this.props.initialIsShown,
      stepTitle : ""
    }
  },
  getMeteorData() {
    return {}
  },
  handleKeyUp(e) {
    if (e.keyCode === 27) {//esc
      this.setState({ isShown : false });
    }
  },
  handleInputOnChange(e) {
    this.setState({ stepTitle : e.target.value });
  },
  _submitFn() {
    var text = this.state.stepTitle;
    var taskId = this.props.taskId;
    Tasks.Steps.add(text, taskId,
        (function() {
          this.toggle();
          this.setState({ stepTitle : "" })
        }).bind(this));
  },
  handleSubmit(form) {
    form.preventDefault();
    this._submitFn();
  },
  toggle() {
    this.setState({ isShown : !this.state.isShown });
  },
  shownOr() {
    return this.state.isShown ? "" : "hide";
  },
  render() {
    return (
        <div className={ "sub add-step-form " + this.shownOr() }>
        <form onSubmit={ this.handleSubmit } className="add" id={ 'edit-step' }>
        <input onChange={ this.handleInputOnChange }
               onKeyUp={ this.handleKeyUp }
               name="text"
               className="text"
               value={ this.state.stepTitle }
               type="text" required placeholder="Describe your action here, press enter to add."/>
        <button className="submit" action="submit">Add</button>
        </form>
        </div>
  );
  }
});
