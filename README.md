# Serverless CRUD: Using DynamoDB, API Gateway, and Lambda.

## Description
This project aims to demonstrate proficiency in building a miroservice using AWS services that can perform CRUD (create, read, update, and delete) operations on a non-SQL database. The front-end of the application is built using HTML, CSS, and JavaScript hosted on S3, while the back-end utilizes API Gateway, Lambda, and DynamoDB to handle data manipulation and storage. The project showcases the ability to design and implement a scalable and flexible system for managing data in a modern, cloud-based environment.

#### Use this [link](http://crud-operation-static-web.s3-website-us-east-1.amazonaws.com/) to access the live website


## Prerequisites
* A AWS account and access to the AWS Management Console
* Basic knowledge of HTML, CSS, JavaScript, and Python
* Basic knowledge of API Gateway, Lambda, and DynamoDB

![Microservice Architecture Diagram](./images/Simple%20CRUD%20Microservice%20Architecture.PNG "Architecture Diagram")


## Features
* Click "**List all Student**" to update the table with all the student in the database.
* To add an item, click "**Add Student**", fill in all the fields and click "**Add Student**" below the form.
* To update an item, click "**Update a Student**", insert student email in first textbox, then click "**Search**". The student information will be displayed in the form below. Update the required field and click "**Update Student**" to save information.
* To delete a student, click on "**Delete a Student**", input the student email in the textbox and click "**Delete Student**".

## Built With
* **_HTML_** - The front-end markup language
* **_CSS_** - The front-end stylesheet language
* **_Javascript_** - The front-end scripting language
* **_AWS API Gateway_** - The back-end API management service
* **_AWS Lambda_** - The back-end serverless computing platform
* **_Python_** - The back-end scripting language
* **_AWS DynamoDB_** - The back-end NoSQL database service
* **_AWS S3_** - Hosts the front-end and make it available on the internet

## General Guides:
#### Create an IAM Role for Lambda
* Navigate to the [IAM console](https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/home) in your AWS account
* Click the "Roles" menu item on the left side of the screen.
* Click the "Create role" button.
* In the "Select type of trusted entity" panel, select "AWS service" as the trusted entity type and choose "Lambda" from the list of AWS services.
* Click the "Next: Permissions" button to proceed to the next step.
* In the "Attach permissions policies" panel, search for and select the "**CloudWatchFullAccess**" policy. This will give your Lambda function full access to CloudWatch. (Cloudwatch will later be used to see execution logs)
* Search for and select the "**AmazonDynamoDBFullAccess**" policy. This will give your Lambda function full access to DynamoDB.
* Click the "Next: Review" button to review your role.
* Give your role a name and optional description, then click the "Create role" button.

Your IAM role is not set up to give Lambda function access to Cloudwatch and DynamoDB.

#### Setting up a Lambda Function
* Navigate to the [Lambda console](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) in your AWS Account
* Click the "Create function" button.
* Select the "Author from scratch" option and give your function a name.
* Select "Python 3.8" as the runtime.
* In the "Permissions" section, choose an the role we created in previous section.
* Click the "Create function" button to create your Lambda function.
* In the "Function code" section, write your Python code and use the "**boto3**" library to interact with DynamoDB.
* In the "Designer" section, click the "Add trigger" button.
* In the "Trigger configuration" panel, select "API Gateway" as the trigger type and choose the API Gateway that you want to use to trigger your Lambda function. (Note: In the next section, we will create an API Gateway. Once you complete the steps in the next section, re-do this step)

Your Lambda function should now be able to run Python code and interact with DynamoBD. (Note: The DynamoDB table has not been created yet. We will create it in the last section.)

#### Setting up API Gateway
* Navigate to the [API Gateway console](https://us-east-1.console.aws.amazon.com/apigateway/main/apis?region=us-east-1) in your AWS account.
* Click the "Create API" button.
* Choose the "REST" protocol and click the "Build" button.
* Give your API a name and choose the "New Resource" option.
* Create a new resource for each of the CRUD operations. Note: in this project, all CRUD operations are done using "POST" method
* In the Integration Type dropdown, select "Lambda Function" and then enter the name of the Lambda function (created in previous section) in the Lambda Function text field. 
* Click the "Actions" dropdown and select "Deploy API"
* Copy the "Invoke URL" that appears in the Deployment Information panel. This is the URL you will use to access your API endpoint.
* Test your API endpoint by sending an HTTP request to the "Invoke URL" using a tool such as cURL or Postman.

Your API Gateway should now be set up to trigger your lambda function when an HTTP request is sent to the specified endpoint.

#### Setting up a DynamoDB
* Navigate to the [DynamoDB console](https://us-east-1.console.aws.amazon.com/dynamodbv2/home?region=us-east-1#dashboard) in your AWS account
* Click the "Create table" button.
* In the "Table details" panel, enter a name for your table and write "id" for the partition key. "id" will be of type "String"
* Leave the "Default settings" option selected.
* Click the "Create" button to create your table.

Your DynamoDB table is now set up. You can use the boto3 library in your Lambda function to interact with your table and perform CRUD operations.

#### Hosting front-end (HTML, CSS, Javascript) files into S3 bucket.
* Navigate to the [S3 console](https://s3.console.aws.amazon.com/s3/buckets?region=us-east-1) in your AWS account.
* Click the "Create bucket" button.
* Give your bucket a unique name and select a region. (Create it to the same region where the lambda and DynamoDB table are created.)
* Under "Object Ownership", leave "ACLs enabled" selected.
* Click the "Create" button to create your bucket and click on your new bucket to open it.
* Click the "Upload" button.
* Drag and drop your HTML, CSS and Javascript files into the "Drop files here" area, or click the "Add files" button to select the files from your local file system. 
* To host your static website on S3, you will need to enable the "Static website hosting" feature for your bucket. To do this, click the "Properties" tab and then click the "Static website hosting" card.
* In the "Static website hosting" panel, select the "Use this bucket to host a website" option and enter the name of your index document (e.g. "index.html").
* Click the "Save" button to enable static website hosting for your bucket. Note the URL displayed in the "Static website hosting" panel. You will use this URL to access your website.
* Finally, navigate to your bucket under "Objects", choose all HTML, CSS, and Javascript file. Click on "Actions" and click on "Make public using ACL" from the dropdown.

Your static website is now hosted on S3 and can be accessed from a web browser. 


## Issues experienced while building this project:
* When performing a fetch from the front-end to the API gateway, I was getting a CORS Policy Violation error. This error was fixed by enabling CORS for this particualr resource in API Gateway. Here's a screenshot of the CORS setting after being updated:

![CORS Setting in API Gateway](./images/CORS_setting.PNG "CORS Setting")

