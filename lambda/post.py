import json
import os
import uuid

import boto3

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def handler(event, context):
    try:
        body = json.loads(event['body'])
        item = {
            'id': str(uuid.uuid4()),  # Generate a unique ID
            **body
        }
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item added', 'item': item})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
