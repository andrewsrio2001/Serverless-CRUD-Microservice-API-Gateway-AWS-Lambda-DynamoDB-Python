from __future__ import print_function
import boto3
import json

def convertJsonIntoAttributeUpdateFormat(dictObj, actionType):
    # This function will take in a dict formatted in a certain way and reformat it to add
    # Action and Value keys to pass to dynamoDb to update a record.
    # ActionType cam be PUT, ADD, etc...
    # Keys will be id, first_name, last_name, address.

    formattedDict = {
        'first_name':{
            'Action': actionType,
            'Value': dictObj['first_name']
        },
        'last_name':{
            'Action': actionType,
            'Value': dictObj['last_name']
        },
        'address':{
            'Action': actionType,
            'Value': dictObj['address']
        }
    }

    return formattedDict

def convert_json_to_dynamodb(json_obj):
  
    # Create a new dictionary to store the converted data
    dynamodb_data = {}

    # Iterate through each key-value pair in the data
    for key, value in json_obj.items():
        # Determine the data type of the value
        if isinstance(value, str):
            data_type = 'S'
        elif isinstance(value, int) or isinstance(value, float):
            data_type = 'N'
        elif isinstance(value, dict):
            data_type = 'M'
        elif isinstance(value, list):
            data_type = 'L'
        else:
            # Use 'S' as the default data type
            data_type = 'S'

        # Add the key-value pair to the new dictionary, with the data type specified
        dynamodb_data[key] = {data_type: value}

    return dynamodb_data



def lambda_handler(event, context):
    
    '''
    Each event will have the following keys:
    
    Operation: The CRUD operation to perform on the dynamoDB table. Can be create, read, update, delete, list, echo, ping
    tableName: The name of the dynamoDB table on which to perform the operation.
    payload: The actual content of the request.
    '''
    
    operation = event['operation']
    payload = event['payload']
    
    if 'tableName' in event:
        dynamoDB = boto3.client('dynamodb')
        
    # Check the operation requested.
    if operation == "read":
        response = dynamoDB.get_item(TableName=event['tableName'], Key = convert_json_to_dynamodb(payload['Item']))
        
        if (response['ResponseMetadata']['HTTPStatusCode'] != 200):
            return ({'statusCode': 500, 'message': 'An error occurred in database. Try again later'})
            
        # check if item exists
        if ("Item" in response):
            
            #convert response from dynamo format into simple dict.
            item = {'id': response['Item']['id']['S'], 'first_name': response['Item']['first_name']['S'], 'last_name': response['Item']['last_name']['S'], 'address': response['Item']['address']['S']}
            
            return ({'statusCode': 200, 'Item': item, 'message': 'Success'})
          
        else:
            return ({'statusCode': 404, 'message': 'Student not found'})
    
    elif operation == "create":
        
        # Check if student already exists.
        response = dynamoDB.get_item(TableName=event['tableName'], Key = convert_json_to_dynamodb({'id': payload['Item']['id']}))
        if ("Item" in response):
            return ({'statusCode': 409, 'message': 'Student already exists. Please update his info instead.'})
        
        response = dynamoDB.put_item(TableName=event['tableName'], Item = convert_json_to_dynamodb(payload['Item']))
        
        if (response['ResponseMetadata']['HTTPStatusCode'] == 200):
            return ({'statusCode': 200, 'message': 'Student has been added in database'})
        else:
            return ({'statusCode': 500, 'message': 'Database encountered an error'})
    
    
    elif operation == "update":

        dynamoFormatItem = convert_json_to_dynamodb(payload['Item'])

        key = {
            'id': dynamoFormatItem['id']
        }
        record = dynamoDB.get_item(TableName=event['tableName'], Key = key)

        if ('Item' in record):
            # Check if user wants to update anything except email (Key)
            if(len(dynamoFormatItem["newID"]['S'].strip()) == 0):
                response = dynamoDB.update_item(TableName=event['tableName'], Key = key, AttributeUpdates= convertJsonIntoAttributeUpdateFormat(dynamoFormatItem, 'PUT'))
                if (response['ResponseMetadata']['HTTPStatusCode'] == 200):
                    return ({'statusCode': 200, 'message': 'Student info has been updated'})
                else:
                    return ({'statusCode': 500, 'message': 'Database encountered an error'})
            else:
                #delete old email anad add new one
                
                 # Check if the new email being updated already exists in database.
                response = dynamoDB.get_item(TableName=event['tableName'], Key = convert_json_to_dynamodb({'id': payload['Item']['newID']}))
                if ("Item" in response):
                    return ({'statusCode': 409, 'message': 'New email already exists in database. Please use a different email address'})
                
                dynamoDB.delete_item(TableName = event['tableName'], Key = convert_json_to_dynamodb({'id': payload['Item']['id']}))
                payload['Item']['id'] = payload['Item']['newID']
                payload['Item'].pop('newID')
                response = dynamoDB.put_item(TableName=event['tableName'], Item = convert_json_to_dynamodb(payload['Item']))
                if (response['ResponseMetadata']['HTTPStatusCode'] == 200):
                    return ({'statusCode': 200, 'message': 'Student info has been updated'})
                else:
                    return ({'statusCode': 500, 'message': 'Database encountered an error'})
       
        else:
           return {'status': 404, 'message': 'Student not found'}
        
    elif operation == "delete":
        
        # Check if student already exists.
        response = dynamoDB.get_item(TableName=event['tableName'], Key = convert_json_to_dynamodb(payload['Item']))
        
        if ('Item' not in response):
            return ({'statusCode': 404, 'message': 'Student does not exist or has already been deleted'})
        
        response = dynamoDB.delete_item(TableName = event['tableName'], Key = convert_json_to_dynamodb(payload['Item']))
        
        if (response['ResponseMetadata']['HTTPStatusCode'] == 200):
            return ({'statusCode': 200, 'message': 'Student has been deleted from database'})
        else:
            return ({'statusCode': 500, 'message': 'Database encountered an error'})
        
    elif operation == "list":
        return dynamoDB.scan(TableName = event['tableName'])
        
    elif operation == "echo":
        return payload["Item"]
        
    elif event["operation"] == "ping":
        return "Pong"
    
    else:
        raise ValueError ("Unrecognized operation '{}'".format(operation))
    return 