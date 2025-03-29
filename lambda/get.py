import json
import logging
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

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
        response = table.scan()
        return {
            'statusCode': 200,
            'body': json.dumps(response['Items'], default=decimal_to_json)
        }
    except Exception as e:
        logger.error(f"Error occurred while scanning the table: {e}")
        return {
            'statusCode': 500,
            'body': str(e)
        }
