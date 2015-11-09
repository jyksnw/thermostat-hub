/**
 * Created by Jason Snow on 10/24/15.
 */

/**
 * Returns all registered thermostats
 */
Meteor.publish('thermostats', function () {
    return ThermostatCollection.find({});
});

/**
 * Returns the thermostat object for the given _id
 */
Meteor.publish('thermostat', function (_id) {
    return ThermostatCollection.find({
        _id: _id
    });
});

Meteor.methods({
    /**
     * Updates the thermostats name
     * @param thermostat - the thermostat object to update
     */
    'updateThermostat' : function(thermostat) {
       if (thermostat) {
           ThermostatCollection.update(thermostat._id, {
               $set: {
                   name: thermostat.name
               }
           })
       }
   }
});