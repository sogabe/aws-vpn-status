# aws-vpn-status

aws-vpn-status is a Lambda function that provides a CloudWatch Custom Metric of vpn status.

# Usage

```bash
cd aws-vpn-status
npm install -save async
zip -r ../vpn-status.zip .
cd ..
aws s3 cp vpn-status.zip s3://(bucket-name)/vpn-status.zip
```


This software is released under the MIT License, see LICENSE.txt.
