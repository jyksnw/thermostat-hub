/**
 * Created by jasonsnow on 10/24/15.
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