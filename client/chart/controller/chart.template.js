/**
 * Created by jasonsnow on 10/25/15.
 */

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
    var updateInterval = 500;
    var dataLength = 500;

    var updateChart = function () {
        var tempData = null;
        var lastPoll = Session.get('lastPoll');


        if (!lastPoll) {
            tempData = TemperatureCollection.find({}, {
                limit: dataLength
            }).fetch();
        } else {
            tempData = TemperatureCollection.find({
                receivedAt: {
                    $gt: lastPoll
                }
            }, {
                sort: {
                    receivedAt: -1
                },
                limit: dataLength
            }).fetch();
        }

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