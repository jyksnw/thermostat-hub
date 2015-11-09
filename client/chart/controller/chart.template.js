/**
 * Created by Jason Snow on 10/25/15.
 */

// Setup a session variable called lastPoll
Session.set('lastPoll', null);
Meteor.subscribe('temperatures');

Template.chart.rendered = function () {
    var temperatures = [];

    var chart = new CanvasJS.Chart('temperatureChart',{
        zoomEnabled: true,
        title :{
            text: 'Temperature Readings'
        },
        axisY: {
            includeZero: false
        },
        data: [{
            type: 'line',
            xValueType: 'datetime',
            name: 'Temperature',
            showInLegend: true,
            dataPoints: temperatures
        }],
        legend: {
            verticleAlign: 'top',
            horizontalAlign: "center",
            fontsize: 14,
            cursor: 'pointer'
        }
    });

    var yVal = 0;
    var updateInterval = 500;   // The time(ms) to wait before updating the chart
    var dataLength = 500;       // Total number of data points to show on the chart

    /**
     * Updates the chart with new data collected since last pollInterval
     */
    var updateChart = function () {
        var tempData = null;
        // Get the last poll time
        var lastPoll = Session.get('lastPoll');


        if (!lastPoll) {
            tempData = TemperatureCollection.find({}, {
                limit: dataLength
            }).fetch();
        } else {
            tempData = TemperatureCollection.find({
                receivedAt: {
                    // Only request for new documents received afer the last poll time
                    $gt: lastPoll
                }
            }, {
                sort: {
                    receivedAt: -1
                },
                limit: dataLength
            }).fetch();
        }

        // Set any new data points on the chart by iterating over the new data set.
        tempData.forEach(function (data) {
            yVal = Math.round(data.temperatureValue);
            temperatures.push({
               x: data.receivedAt,
               y: yVal
           })
        });

        if (temperatures.length > dataLength)
        {
            temperatures.shift();
        }

        chart.render();

        Session.set('lastPoll', new Date());
    };

    updateChart();
    setInterval(function(){updateChart()}, updateInterval);
};