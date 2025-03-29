import json
import logging
import os
import uuid
from decimal import Decimal

import boto3

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

# Helper function to convert Decimal to JSON-serializable types
def decimal_to_json(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

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
            'body': json.dumps({'message': 'Item added', 'item': item}, default=decimal_to_json)
        }
    except Exception as e:
        logger.error(f"Error occurred while adding an item to the table: {e}")
        return {
            'statusCode': 500,
            'body': str(e)
        }
