// Global variables
var dynamoDBTableName = "lambda-apigateway-student_info";
var APIURL =
  "https://x1chs40000.execute-api.us-east-1.amazonaws.com/Prod/dynamodbmanager";

// By Default, when page loads, make all form component invisible
window.document.getElementById("addStudentDiv").style.visibility = "hidden";
window.document.getElementById("addStudentDiv").style.display = "none";
window.document.getElementById("updateStudentDiv").style.visibility = "hidden";
window.document.getElementById("updateStudentDiv").style.display = "none";
window.document.getElementById("deleteStudentDiv").style.visibility = "hidden";
window.document.getElementById("deleteStudentDiv").style.display = "none";

// Populate all students table
listAllStudent();

function displayAddStudentForm() {
  // This function will display the form to the user to add a new student.
  // And hide all other components
  window.document.getElementById("addStudentDiv").style.visibility = "visible";
  window.document.getElementById("addStudentDiv").style.display = "block";

  //hide all other forms
  window.document.getElementById("updateStudentDiv").style.visibility =
    "hidden";
  window.document.getElementById("updateStudentDiv").style.display = "none";
  window.document.getElementById("deleteStudentDiv").style.visibility =
    "hidden";
  window.document.getElementById("deleteStudentDiv").style.display = "none";
}

function displayUpdateStudentForm() {
  // This function will display the form to the user to update a student.
  // And hide all other components
  window.document.getElementById("updateStudentDiv").style.visibility =
    "visible";
  window.document.getElementById("updateStudentDiv").style.display = "block";
  //hide all other forms
  window.document.getElementById("addStudentDiv").style.visibility = "hidden";
  window.document.getElementById("addStudentDiv").style.display = "none";
  window.document.getElementById("deleteStudentDiv").style.visibility =
    "hidden";
  window.document.getElementById("deleteStudentDiv").style.display = "none";
}

function displayDeleteStudentForm() {
  // This function will display the form to the user to delete a student.
  // And hide all other components
  window.document.getElementById("deleteStudentDiv").style.visibility =
    "visible";
  window.document.getElementById("deleteStudentDiv").style.display = "block";

  //hide all other forms
  window.document.getElementById("addStudentDiv").style.visibility = "hidden";
  window.document.getElementById("addStudentDiv").style.display = "none";
  window.document.getElementById("updateStudentDiv").style.visibility =
    "hidden";
  window.document.getElementById("updateStudentDiv").style.display = "none";
}

async function listAllStudent() {
  // This function will send an HTTP post request to the lambda function.

  var payload = {
    operation: "list",
    tableName: dynamoDBTableName,
    payload: {
      Item: {},
    },
  };

  fetch(APIURL, {
    method: "POST",
    headers: {
      "Content-Type": "text/pain",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      recreateTableInHTML(data);
    })
    .catch((err) => {
      console.log(
        "An error occurred while trying to get all the data from DB: " + err
      );
      alert('An error occurred. Please try again later');
    });
}

function recreateTableInHTML(data) {
  // This function takes in a json object containing all the data from the database
  // Will print the data into the table in the html file.

  items = data["Items"];
  // Clean the table body
  window.document.getElementById("tableBody").innerHTML = "";
  var block = "";
  // Build HTML block for table body
  for (var key in items) {
    block = block + "<tr>";
    block = block + '<th scope="row">' + key + "</th>";
    block = block + "<td>" + items[key]["first_name"]["S"] + "</td>";
    block = block + "<td>" + items[key]["last_name"]["S"] + "</td>";
    block = block + "<td>" + items[key]["id"]["S"] + "</td>";
    block = block + "<td>" + items[key]["address"]["S"] + "</td>";
    block = block + "</tr>";
  }
  // Add  block to table
  window.document.getElementById("tableBody").innerHTML = block;
}

async function addStudent() {
  // This function will read in the values in the form and add a student in the database

  var firstName = window.document.getElementById("firstNameAdd").value.trim();
  var lastName = window.document.getElementById("lastNameAdd").value.trim();
  var email = window.document.getElementById("inputEmailAdd").value.trim();
  var address = window.document.getElementById("inputAddressAdd").value.trim();


   // Check if no textbox is empty
   if (!(firstName && lastName && email && address)){
    alert("Please fill in all the textboxes and try again.");
    return;
  } 


  // Insert element in database
  payload = {
    operation: "create",
    tableName: dynamoDBTableName,
    payload: {
      Item: {
        id: email,
        first_name: firstName,
        last_name: lastName,
        address: address,
      },
    },
  };

  console.log(payload);

  fetch(APIURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      var message = await response.text();
      message = JSON.parse(message);
      console.log(message)

      if (message['statusCode'] === 200){
        alert(message.message);
      }else{
        throw message.message;
      }

    })
    .catch((err) => {
      console.log("There was an error inserting element into database: " + err);
      alert(err)
    });
}

async function updateStudent() {
  // This function will read in the values in the form and update a student in the database

  var emailIdentifier = window.document
    .getElementById("inputEmailUpdateIdentifier")
    .value.trim();
  var firstName = window.document.getElementById("firstNameUpdate").value.trim();
  var lastName = window.document.getElementById("lastNameUpdate").value.trim();
  var email = window.document.getElementById("inputEmailUpdate").value.trim();
  var address = window.document.getElementById("inputAddressUpdate").value.trim();

  // Check if no textbox is empty
  if (!(firstName && lastName && email && address)){
    alert("Please fill in all the textboxes and try again.");
    return;
  } 

  // Build payload.
  payload = {
    operation: "update",
    tableName: dynamoDBTableName,
    payload: {
      Item: {
        id: emailIdentifier,
        newID: "",
        first_name: firstName,
        last_name: lastName,
        address: address,
      },
    },
  };

  // If email is being changed. (Email is the primary key in the database)
  if (emailIdentifier != email) {
    payload["payload"]["Item"]["newID"] = email;
  }

  // Send payload to lambda
  fetch(APIURL,{
    method: "POST",
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  })
  .then( async (response) => {
    // Handle response from lambda
    var message = await response.text()
    message = JSON.parse(message);
    console.log(message)
    if(message["statusCode"] == 200){
      alert(message.message);
    }else{
      alert(message.message);
    }

  })
  .catch(err => {
    console.log("An error occurred while trying to update record: " + err);
    alert("An error occurred while trying to update record. Please try again later. View console log for a detailed message on the error.")
  })
}

async function deleteStudent() {
  // This function will delete a student record from the database given the student email address.

  // Read the student email address from the textbox
  var email = window.document.getElementById("inputEmailDelete").value.trim();

  if(!email) {
    alert("Enter an email to delete a student");
    return;
  }

  // Build payload
  payload={
    operation: "delete",
    tableName: dynamoDBTableName,
    payload: {
      Item : {
        id: email,
      },
    },
  };
  
  // Send request to lambda
  fetch(APIURL, {
    method: "POST",
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  })
  .then(async (response) =>{
    // handle response from lambda
    var message = await response.text();
    message = JSON.parse(message);
    console.log(message)
    if(message["statusCode"] == 200){
      alert(message.message);
    }else{
      throw message.message;
    }

  })
  .catch((err) => {
    console.log(err);
    alert(err);
  })

  // Clear textbox
  window.document.getElementById("inputEmailDelete").value = "";

}

async function searchStudentToUpdate(){
  // This function will read in an iteam and get all its associated data and populate the
  // update student form.

  var email = window.document.getElementById("inputEmailUpdateIdentifier").value;

  if (!email) {
    alert("Enter email of student to search");
    return;
  }
  // Create payload
  payload = {
    operation: 'read',
    tableName: dynamoDBTableName,
    payload:{
      Item:{
        id: email,
      }
    },
  };

  // Send request to lambda
  fetch(APIURL, {
    method: 'POST',
    headers:{
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  })
  .then(async (response) =>{
    var message = await response.text();
    message = JSON.parse(message);
    if(message.statusCode === 200){
      // Render values in textbox
      window.document.getElementById("firstNameUpdate").value = message.Item['first_name'];
      window.document.getElementById("lastNameUpdate").value = message.Item['last_name'];
      window.document.getElementById("inputEmailUpdate").value = message.Item['id'];
      window.document.getElementById("inputAddressUpdate").value = message.Item['address'];

    }else{
      throw message.message;
    }
  })
  .catch((err) =>{
    console.log(err);
    alert(err);
  })
}
