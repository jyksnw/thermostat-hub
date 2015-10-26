/**
 * Created by jasonsnow on 10/24/15.
 */

/**
 * Returns all recorded temperatures
 */
Meteor.publish('temperatures', function () {
    return TemperatureCollection.find({});
});