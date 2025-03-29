import os

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def handler(event, context):
    try:
        response = table.scan()
        return {
            'statusCode': 200,
            'body': response['Items']
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
