/**
 * Created by jasonsnow on 10/25/15.
 */

Meteor.subscribe('thermostats');

Template.thermostats.helpers ({
    thermostats: function() {
        return ThermostatCollection.find();
    },

    isAlarmOn: function(alarmState) {
      if (alarmState === 'ON') {
          return true;
      }  else {
          return false;
      }
    }
});

Template.thermostats.events({
    'click .remove-thermostat' : function (e) {
        e.preventDefault();

        var thermostatId = this._id;

        alert('Deleting ' + thermostatId);

        Meteor.call('unsubscribeFromThermostat', thermostatId);
    },
    'click .thermostat-settings': function(e) {
        e.preventDefault();

        var thermostatId = this._id;
        Session.set('selectedThermostat', thermostatId);

        Modal.show('editThermostat');
    }
});