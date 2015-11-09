/**
 * Created by Jason Snow on 10/21/15.
 */


var client = mqtt.connect(Meteor.settings.mqtt_options);

client.on('connect', function () {
    var connectionId = Math.floor(Math.random()*90000) + 10000;

    client.publish('presence/thermostat-hub', connectionId);

    client.subscribe('presence/thermostat');
    resubscribeToThermostats();
});

client.on('message', function (topic, message) {
    if (topic === 'presence/thermostat') {
        subscribeToThermostat(message.toString());
    }

    if (topic.endsWith('/alarm')) {
        processThermostatAlarm(topic, message.toString());
    }

    if (topic.endsWith('/setTemp')) {
        recordThermostatTemperatureThreshold(topic, message.toString());
    }

    if (topic.endsWith('/currentTemp')) {
        recordThermostatCurrentTemperature(topic, message.toString());
    }
});

/**
 * Subscribes to the thermostat
 */
var subscribeToThermostat = Meteor.bindEnvironment(function (deviceId) {
    if (deviceId) {
        var thermostatPath = 'thermostat/' + deviceId;
        console.log('Subscribing to: ' + thermostatPath);

        var thermostat = ThermostatCollection.findOne({deviceId: deviceId});

        if (!thermostat) {
            ThermostatCollection.insert({
                name: 'thermostat ' + deviceId,
                deviceId: deviceId,
                priority: 0,
                createdOn: new Date(),
                lastUpdated: new Date(),
                alarmState: null,
                setTemperature: 0.0,
                currentTemperature: 0.0
            });
        } else {
            ThermostatCollection.update(thermostat._id, {
                $set: {lastUpdated: new Date()}
            });

            client.publish(thermostatPath + '/setTemp', thermostat.setTemperature);
        }

        client.subscribe(thermostatPath + '/alarm');
        client.subscribe(thermostatPath + '/setTemp');
        client.subscribe(thermostatPath + '/currentTemp');
    }
});

/**
 * Resubscribes to all known thermostat devices
 */
var resubscribeToThermostats = Meteor.bindEnvironment(function() {
    var thermostats = ThermostatCollection.find();

    thermostats.forEach(function(thermostat) {
        if (thermostat.deviceId) {
            subscribeToThermostat(thermostat.deviceId);
        }
    });
});

/**
 * Process the thermostats alarm state
 */
var processThermostatAlarm = Meteor.bindEnvironment(function (topic, data) {
    var deviceId = topic.extractString('thermostat/', '/alarm');

    if (deviceId) {
        var thermostat = ThermostatCollection.findOne({deviceId: deviceId});

        if (!thermostat) {
            console.log('Received an alarm for an unregistered device; Device ID: ' + deviceId);
            return;
        }

        console.log('Setting alarm state ' + data + ' for device ' + deviceId);

        var alarmState = data.toUpperCase();
        if (thermostat.alarmState !== alarmState) {
            if (alarmState === 'ON') {
                // TODO: This could be a good place to raise an event for the alarm being on
                console.log('MOCK: Alarm on event thrown!');
            } else if (alarmState === 'OFF') {
                // TODO: This could be a good place to raise an event for the alarm being off
                console.log('MOCK: Alarm off event thrown!')
            }
        }

        ThermostatCollection.update(thermostat._id, {
            $set: {
                lastUpdated: new Date(),
                alarmState: alarmState
            }
        });
    }
});

/**
 * Records the thermostats temperature threshold
 */
var recordThermostatTemperatureThreshold = Meteor.bindEnvironment(function (topic, data) {
    var deviceId = topic.extractString('thermostat/', '/setTemp');

    if (deviceId) {
        var thermostat = ThermostatCollection.findOne({deviceId: deviceId});

        if (!thermostat) {
            console.log('Received a set temperature for an unregistered device; Device ID: ' + deviceId);
            return;
        }

        var setVal = Number(data).toPrecision(4);

        console.log('Updating thermostat ' + deviceId + ' with set temperature ' + setVal);

        ThermostatCollection.update(thermostat._id, {
            $set: {
                lastUpdated: new Date(),
                setTemperature: setVal
            }
        });
    }
});

/**
 * Records the thermostats current temperature
 */
var recordThermostatCurrentTemperature = Meteor.bindEnvironment(function (topic, data) {
    var deviceId = topic.extractString('thermostat/', '/currentTemp');

    if (deviceId) {
        var thermostat = ThermostatCollection.findOne({deviceId: deviceId});

        if (!thermostat) {
            console.log('Received a temperature value for an unregistered device; Device ID: ' + deviceId);
            return;
        }

        var currentVal = Number(data).toPrecision(4);

        console.log('Device ' + deviceId + ' is reporting a temperature of ' + currentVal);

        ThermostatCollection.update(thermostat._id, {
            $set: {
                lastUpdated: new Date(),
                currentTemperature: currentVal
            }
        });

        TemperatureCollection.insert({
            deviceId: deviceId,
            thermostatId: thermostat._id,
            receivedAt: new Date(),
            temperatureValue: currentVal
        });
    }
});

Meteor.methods({
    /**
     * Unsubscribes from the provided thermostat id and removes the thermostat from the system.
     * @param _id - The thermostat id
     */
    'unsubscribeFromThermostat': function (_id) {
        console.log('Unsubscribing from thermostat ' + _id);
        if (_id) {
            var thermostat = ThermostatCollection.findOne({_id: _id});

            if (thermostat) {
                var thermostatPath = 'thermostat/' + thermostat.deviceId;
                console.log('Unsubscribing from: ' + thermostatPath);

                client.unsubscribe(thermostatPath + '/alarm');
                client.unsubscribe(thermostatPath + '/setTemp');
                client.unsubscribe(thermostatPath + '/currentTemp');

                var thermostatValues = TemperatureCollection.find({thermostatId: thermostat._id});

                thermostatValues.forEach(function (value) {
                    TemperatureCollection.remove(value._id);
                });

                ThermostatCollection.remove(thermostat._id);
            }
        }
    },
    /**
     * Updates the thermostats set temperature threshold value
     * @param _id - The thermostat id
     * @param setVal - The new set temperature value
     */
    'updateSetTemperatureThreshold': function (_id, setVal) {
        if (_id) {
            var thermostat = ThermostatCollection.findOne({_id: _id});

            if (thermostat) {
                var thermostatPath = 'thermostat/' + thermostat.deviceId + '/setTemp';
                var numSetVal = Number(setVal).toPrecision(4);

                client.publish(thermostatPath, numSetVal);
            }
        }
    }
});
