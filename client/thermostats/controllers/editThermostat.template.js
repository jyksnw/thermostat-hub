/**
 * Created by Jason Snow on 10/25/15.
 */

Template.editThermostat.helpers({
    /**
     * Gets the selected thermostat object
     * @returns - the thermostat if found otherwise returns null
     */
    'thermostat': function() {
        // Retrieve the selected thermostat from our session variable
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
    /**
     * Updates the current thermostat settings
     * @param e - the event
     * @param template - the calling template
     */
    'click #update' : function(e, template) {
        e.preventDefault();

        var thermostatId = Session.get('selectedThermostat');
        var setTemp = template.find('.tSetTemp').value;
        var newName = template.find('.tName').value;

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