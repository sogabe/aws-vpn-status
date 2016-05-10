//
// Put DirectConnect status to CloudWatch custom metrics
//

var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';
// npm install -save async

function putMetric(data, callback) {
    var cloudwatch = new AWS.CloudWatch();
    var stat_val;

    if (data.virtualInterfaceState == "available")
        stat_val = 1.0;
    else
        stat_val = 0.0;

    var params = {
        MetricData: [ /* required */
	    {
                MetricName: data.virtualInterfaceId, /* required */
                Dimensions: [
		    {
                        Name: 'connection_id', /* required */
                        Value: data.connectionId /* required */
		    },
		    /* more items */
                ],
                Timestamp: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
                Unit: 'None',
                Value: stat_val
	    },
	    /* more items */
        ],
        Namespace: "dx_status" /* required */
    };
    cloudwatch.putMetricData(params, function(err, data) {
        if (err) {
	    console.log(err, err.stack); // an error occurred
            done("Error", "putMetricData");
        }
	callback();
    });
    console.log("connection_id", data.connectionId, "vif_id", data.virtualInterfaceId, " (", stat_val , ")");
}

exports.handler = function(event, context) {
    var async = require('async');
    var params = {};

    var dx = new AWS.DirectConnect();
    dx.describeVirtualInterfaces(params, function(err, data) {
	async.each(data.virtualInterfaces, function(item, done) {
	    putMetric(item, done);
	}, function(err, values) {
	    if (err)
		console.log(err);
	    context.done(null, "OK");
	});
    }, function(err, results) {
	if (err)
	    console.log(err);
    });
};
