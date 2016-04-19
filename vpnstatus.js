//
// Put VPN status to CloudWatch custom metrics
//

var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';
// npm install -save async

function putMetric(data, tunIndex, callback) {
    var cloudwatch = new AWS.CloudWatch();
    var vpn_status = data.VgwTelemetry;
    var stat_val;
    var vpnid = data.VpnConnectionId;

    if (vpn_status[tunIndex].Status == "UP")
        stat_val = 1.0;
    else
        stat_val = 0.0;

    var params = {
        MetricData: [ /* required */
	    {
                MetricName: 'Tunnel_' + String(tunIndex), /* required */
                Dimensions: [
		    {
                        Name: 'vpnid', /* required */
                        Value: vpnid /* required */
		    },
		    /* more items */
                ],
                Timestamp: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
                Unit: 'None',
                Value: stat_val
	    },
	    /* more items */
        ],
        Namespace: "vpn_status" /* required */
    };
    cloudwatch.putMetricData(params, function(err, data) {
        if (err) {
	    console.log(err, err.stack); // an error occurred
            done("Error", "putMetricData");
        }
	callback();
    });
    console.log("vpnid=", vpnid, "Tunnel", tunIndex, "=", vpn_status[tunIndex].Status, " (", stat_val, ")");
}

exports.handler = function(event, context) {
    var async = require('async');
    var params = {
	DryRun: false
    };

    var ec2 = new AWS.EC2();
    ec2.describeVpnConnections(params, function(err, data) {
	async.each(data.VpnConnections, function(item, done) {
	    iter = [0, 1];
	    async.each(iter, function(tunIdx, done2) {
		putMetric(item, tunIdx, done2);
	    }, function(err) {
		if (err)
		    console.log('internal loop');
		done();
	    });
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
