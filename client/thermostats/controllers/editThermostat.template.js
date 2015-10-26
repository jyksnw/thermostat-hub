/**
 * Created by jasonsnow on 10/25/15.
 */

Template.editThermostat.helpers({
    'thermostat': function() {
        var thermostatId = Session.get('selectedThermostat');

        if (typeof thermostatId !== 'undefined') {
            var thermostat = ThermostatCollection.findOne({ _id: thermostatId});

            if (thermostat) {
                return thermostat;
            }
        }

        return null;
    }
});

Template.editThermostat.events({
    'click #update' : function(e, template) {
        e.preventDefault();

        var thermostatId = Session.get('selectedThermostat');
        var setTemp = template.find('.tSetTemp').value;
        var newName = template.find('.tName').value;

        console.log("Set Temp " + setTemp);
        console.log("Name " + newName);

        if (thermostatId) {
            var thermostat = {
                _id: thermostatId,
                name: newName
            };

            Meteor.call('updateThermostat', thermostat);

            if (setTemp > 0) {
                Meteor.call('updateSetTemperatureThreshold', thermostatId, setTemp);
            }
        }

        Modal.hide('editThermostat');
    }
});