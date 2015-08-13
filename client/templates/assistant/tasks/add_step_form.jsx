/*

Template.assistantTasksAddStep.onCreated(function() {

  _.extend(this, {
    isStepFormShown: new ReactiveVar(false)
  });
});

Template.assistantTasksAddStep.onRendered(function() {
  let selfTemplate = this;
  selfTemplate.$('.sub').on('transitionend onanimationend', function(e) {
    console.log('file');
    if ($(e.target).height() > 1) {
      selfTemplate.$('.text').focus();
    }
  });
  selfTemplate.$('[data-toggle="tooltip"]').tooltip();
});

Template.assistantTasksAddStep.helpers({
  isStepFormShown() {
    return Template.instance().isStepFormShown.get() ? "" : "not-shown";
  }
});

Template.assistantTasksAddStep.events({
  "click .add-step" : function(e, tmpl) {
    tmpl.isStepFormShown.set(true);
  },
  "submit form.add" : function(e) {
    e.preventDefault();
    return _submitFn(Template.currentData(), e, this._id);
  },
  "keyup form.add input" : function(e, tmpl) {
    if (e.keyCode === 27) {//esc
      tmpl.isStepFormShown.set(false);
    }
  }
});

let _submitFn = (data, form, taskId) => {
  let text = form.target.text.value;
  Tasks.Steps.add(text, taskId,
      () => {
        form.target.reset();
        data.isStepFormShown.set(false);
      });
};

 */
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
    //Block-scoped declarations (let, const, function, class) not yet supported outside strict mode
    'use strict';
    let text = this.state.stepTitle;
    let taskId = this.props.taskId;
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
        <form onSubmit={ this.handleSubmit } className="add" id={ 'step.' + this.props._id }>
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
