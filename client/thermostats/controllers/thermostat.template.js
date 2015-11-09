/**
 * Created by Jason Snow on 10/25/15.
 */

Meteor.subscribe('thermostats');

Template.thermostats.helpers ({
    /**
     * Gets a list of all subscribed thermostats
     * @returns {DOMElement|any|Mongo.Cursor|*|{}} - All subscribed thermostats
     */
    thermostats: function() {
        return ThermostatCollection.find();
    },

    /**
     * Checks if the current thermostat has an alarm
     * @param alarmState - the thermostat alarm state text
     * @returns {boolean} - returns true if thermostat has an alarm, otherwise returns false
     */
    isAlarmOn: function(alarmState) {
      if (alarmState === 'ON') {
          return true;
      }  else {
          return false;
      }
    }
});

Template.thermostats.events({
    /**
     * Removes the selected thermostat from the system
     * @param e - click event
     */
    'click .remove-thermostat' : function (e) {
        e.preventDefault();

        var thermostatId = this._id;

        // TODO: Replace this alert with a modal dialog instead
        alert('Deleting ' + thermostatId);

        Meteor.call('unsubscribeFromThermostat', thermostatId);
    },
    /**
     * Launches the thermostat settings modal dialog
     * @param e - click event
     */
    'click .thermostat-settings': function(e) {
        e.preventDefault();

        var thermostatId = this._id;
        Session.set('selectedThermostat', thermostatId);

        Modal.show('editThermostat');
    }
});