AssistantCustomerPreferenceListItem = ReactMeteor.createClass({
  handleDeleteClick(e) {
    var pref = this.props.preference;
    Customers.Preference.delete(pref.userId, pref._id);
    return true;
  },
  render() {
    return (
        <div className="preference">
          { this.props.preference.message }
          <i className="remove glyphicon glyphicon-remove" onClick={ this.handleDeleteClick }></i>
        </div>
    );
  }
});

AssistantCustomerPreferencePane = ReactMeteor.createClass({
  templateName : "assistantCustomerPreferencePane",
  getInitialState() {
    return { isAdding : false }
  },
  getMeteorState() {
    return { customer : Users.findOneCustomer(this.props.customer._id) };
  },
  handleFormSubmit(e) {
    e.preventDefault();
    var message = e.target.message.value;
    var ui = this;
    var isSuccess = Customers.Preference.add(this.state.customer._id, message, function() {
      ui.toggle();
    });
    return isSuccess;
  },
  getPreferences() {
    var user = this.state.customer;
    return _.map(user.getPreferences(), function(preference) { return _.extend({}, preference, { userId : user._id }); });
  },
  toggle() {
    this.setState({ isAdding : !this.state.isAdding});
  },
  render() {
    return (
      <div className='preferences-pane'>
        <h4>Preferences<i className="fa fa-plus open-add-preference-form" onClick={ this.toggle }></i></h4>
        <form onSubmit={ this.handleFormSubmit } id="add-preference" className={ "add-preference " + (this.state.isAdding ? "" : "hide") }>
          <input name="message" className="preference-message" type="text" required placeholder="Preferences..."/>
          <button action="submit">Add</button>
        </form>
        <div className="preferences">
        { this.getPreferences().map(function(preference) {
            return <AssistantCustomerPreferenceListItem preference={ preference } key={ preference._id }/>;
          })
        }
        </div>
      </div>
    );
  }
});
