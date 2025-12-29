# Download-Salesforce-records-in-CSV-file
Salesforce Lightning Web Component with Salesforce Apex backend that allows users to select an sObject, choose fields dynamically, preview records, and export data as a CSV file.

This project is developed on Salesforce Lightning Web Component (LWC) with an Salesforce Apex backend that allows users to dynamically export Salesforce sObject data into a CSV file.
Users can select an sObject (which is configured in LWC component), required fields (which is already seleted with some additional fields & it can not be removed) but choose other optional fields, preview the records in a datatable, and download the data safely while respecting Salesforce governor limits.

🚀🚀 Features :

✅ Select Salesforce standard objects (Lead, Account, Contact, Opportunity, Case) (you can add more in code according to your need)

✅ Dynamically fetch selected sObject all the fields using Apex

✅ Required fields are auto-selected based on sObject (with some additional fields also, relationship fields can be add manually)

✅ User can preview the records in a Lightning Datatable (for only few fields, but while downloading it can download all the selected records)

✅ Export selected data as a CSV file

✅ Handles relationship fields (Account Name, Contact Name ...)

✅ Client-side CSV generation (no file storage needed)

✅ 5.5 MB size validation to stay within Salesforce 6 MB response limit



🧩🧩 Architecture Overview
  Frontend (LWC)
    HTML
      Lightning Card layout
      Lightning Combobox for object selection
      Lightning Dual Listbox for field selection
      Lightning Datatable for record preview
      Lightning Modal popup for CSV file name
    
    JavaScript
      Handles UI state and validations

Calls Apex methods

Formats dates for display

Converts records into CSV format

Triggers file download in browser

Backend (Apex)

LWCController

Fetches object fields dynamically using Schema Describe

Queries records based on selected fields

Serializes records into JSON

Validates response size (5.5 MB safety buffer)

Returns errors using AuraHandledException

📂 Key Apex Methods
getsObjectRecords

Dynamically builds SOQL query

Ensures Id is always included

Serializes query result

Checks payload size before returning data

getObjectsFields

Fetches available fields for selected objects

Filters unwanted/system fields

Returns label-value pairs for UI rendering

🧠 Important Design Decisions

5.5 MB limit is enforced instead of 6 MB to avoid runtime errors

CSV generation is done on the client side for better performance

Relationship fields are handled conditionally (Account.Name, Contact.Name)

Uses @AuraEnabled(cacheable=true) for better performance

Clean separation between UI logic and backend logic

📸 User Flow

Select an sObject from the dropdown

Choose required and optional fields

Click Fetch to retrieve records

Preview data in the table

Click Download, enter file name

CSV file is downloaded instantly

🛠 Technologies Used

Salesforce Lightning Web Components (LWC)

Apex

SOQL

SLDS (Salesforce Lightning Design System)

📌 Use Cases

Export Salesforce data for reporting

Share data with external systems

Backup object records

Admin or developer utility tool

👨‍💻 Author

Aditya Kumar
Salesforce Developer
