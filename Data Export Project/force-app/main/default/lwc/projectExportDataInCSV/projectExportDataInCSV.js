import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import LEAD_OBJECT from "@salesforce/schema/Lead";
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import CONTACT_OBJECT from "@salesforce/schema/Contact";
import OPPORTUNITY_OBJECT from "@salesforce/schema/Opportunity";
import CASE_OBJECT from "@salesforce/schema/Case";

import LEAD_ID_FIELD from "@salesforce/schema/Lead.Id";
import LEAD_NAME_FIELD from "@salesforce/schema/Lead.Name";
import LEAD_LEAD_SOURCE_FIELD from "@salesforce/schema/Lead.LeadSource";
import LEAD_STATUS_FIELD from "@salesforce/schema/Lead.Status";
import LEAD_CREATED_DATE_FIELD from "@salesforce/schema/Lead.CreatedDate";

import ACCOUNT_ID_FIELD from "@salesforce/schema/Account.Id";
import ACCOUNT_NAME_FIELD from "@salesforce/schema/Account.Name";
import ACCOUNT_RATING_FIELD from "@salesforce/schema/Account.Rating";
import ACCOUNT_SOURCE_FIELD from "@salesforce/schema/Account.AccountSource";
import ACCOUNT_CREATED_DATE_FIELD from "@salesforce/schema/Account.CreatedDate";

import CONTACT_ID_FIELD from "@salesforce/schema/Contact.Id";
import CONTACT_NAME_FIELD from "@salesforce/schema/Contact.Name";
import CONTACT_ACCOUNT_ID_FIELD from "@salesforce/schema/Contact.AccountId";
import CONTACT_PHONE_FIELD from "@salesforce/schema/Contact.Phone";
import CONTACT_CREATED_DATE_FIELD from "@salesforce/schema/Contact.CreatedDate";

import OPPORTUNITY_ID_FIELD from "@salesforce/schema/Opportunity.Id";
import OPPORTUNITY_NAME_FIELD from "@salesforce/schema/Opportunity.Name";
import OPPORTUNITY_ACCOUNT_ID_FIELD from "@salesforce/schema/Opportunity.AccountId";
import OPPORTUNITY_STAGE_NAME_FIELD from "@salesforce/schema/Opportunity.StageName";
import OPPORTUNITY_CLOSE_DATE_FIELD from "@salesforce/schema/Opportunity.CloseDate";
import OPPORTUNITY_CREATED_DATE_FIELD from "@salesforce/schema/Opportunity.CreatedDate";

import CASE_ID_FIELD from "@salesforce/schema/Case.Id";
import CASE_CASE_NUMBER_FIELD from "@salesforce/schema/Case.CaseNumber";
import CASE_ORIGIN_FIELD from "@salesforce/schema/Case.Origin";
import CASE_ACCOUNT_ID_FIELD from "@salesforce/schema/Case.AccountId";
import CASE_CONTACT_ID_FIELD from "@salesforce/schema/Case.ContactId";
import CASE_CREATED_DATE_FIELD from "@salesforce/schema/Case.CreatedDate";

import getsObjectRecords from "@salesforce/apex/ExportDataInCSV.getsObjectRecords";
import getObjectsFields from "@salesforce/apex/ExportDataInCSV.getObjectsFields";

const rowEnd = "\n";

const leadColumns = [
  { label: "Name", fieldName: "Name", type: "text", sortable: "true" },
  { label: "Source", fieldName: "LeadSource", type: "text", sortable: "true" },
  { label: "Status", fieldName: "Status", type: "text", sortable: "true" },
  { label: "Created Date", fieldName: "createdDate__js", sortable: "true" }
];

const accountColumns = [
  { label: "Name", fieldName: "Name", type: "text", sortable: "true" },
  { label: "Rating", fieldName: "Rating", type: "text", sortable: "true" },
  {
    label: "Active",
    fieldName: "Active__c",
    type: "boolean",
    sortable: "true"
  },
  { label: "Created Date", fieldName: "createdDate__js", sortable: "true" }
];

const contactColumns = [
  { label: "Name", fieldName: "Name", type: "text", sortable: "true" },
  {
    label: "Account Name",
    fieldName: "accountName__js",
    type: "text",
    sortable: "true"
  },
  { label: "Phone", fieldName: "Phone", type: "phone", sortable: "true" },
  { label: "Created Date", fieldName: "createdDate__js", sortable: "true" }
];

const opportunityColumns = [
  { label: "Name", fieldName: "Name", type: "text", sortable: "true" },
  {
    label: "Account Name",
    fieldName: "accountName__js",
    type: "text",
    sortable: "true"
  },
  {
    label: "Stage Name",
    fieldName: "StageName",
    type: "text",
    sortable: "true"
  },
  {
    label: "Close Date",
    fieldName: "CloseDate",
    type: "date",
    sortable: "true"
  },
  { label: "Created Date", fieldName: "createdDate__js", sortable: "true" }
];

const caseColumns = [
  {
    label: "Case Number",
    fieldName: "CaseNumber",
    type: "text",
    sortable: "true"
  },
  { label: "Case Origin", fieldName: "Origin", type: "text", sortable: "true" },
  {
    label: "Account Name",
    fieldName: "accountName__js",
    type: "text",
    sortable: "true"
  },
  {
    label: "Contact Name",
    fieldName: "contactName__js",
    type: "text",
    sortable: "true"
  },
  { label: "Created Date", fieldName: "createdDate__js", sortable: "true" }
];

export default class ProjectExportDataInCSV extends LightningElement {
  header = "Generate CSV";
  isDisplaySpinner = false;
  isDisplayFetchFields = false;
  isDisplayFetchRecords = false;
  isDisplayFolderModal = false;
  selectedObject;
  sObjects = [
    LEAD_OBJECT.objectApiName,
    ACCOUNT_OBJECT.objectApiName,
    CONTACT_OBJECT.objectApiName,
    OPPORTUNITY_OBJECT.objectApiName,
    CASE_OBJECT.objectApiName
  ];
  sObjectFields = [];
  selectedObjectFields;
  sObjectFieldsOptions = [];
  sObjectRecords = [];
  csvFileName;

  get sObjectOptions() {
    return [
      { label: "--NONE--", value: "" },
      ...(this.sObjects ?? []).map((object) => ({
        label: object,
        value: object
      }))
    ];
  }

  get isComboboxDisabled() {
    return !!(this.selectedObject && this.sObjectFieldsOptions.length > 0);
  }

  get fieldsDualListLabel() {
    return `${this.selectedObject || "Unknown"} Object Fields`;
  }

  get sObjectRequiredOptions() {
    switch (this.selectedObject) {
      case "Lead":
        return [
          LEAD_ID_FIELD.fieldApiName,
          LEAD_NAME_FIELD.fieldApiName,
          LEAD_LEAD_SOURCE_FIELD.fieldApiName,
          LEAD_STATUS_FIELD.fieldApiName,
          LEAD_CREATED_DATE_FIELD.fieldApiName
        ];

      case "Account":
        return [
          ACCOUNT_ID_FIELD.fieldApiName,
          ACCOUNT_NAME_FIELD.fieldApiName,
          ACCOUNT_RATING_FIELD.fieldApiName,
          ACCOUNT_SOURCE_FIELD.fieldApiName,
          ACCOUNT_CREATED_DATE_FIELD.fieldApiName
        ];

      case "Contact":
        return [
          CONTACT_ID_FIELD.fieldApiName,
          CONTACT_NAME_FIELD.fieldApiName,
          CONTACT_ACCOUNT_ID_FIELD.fieldApiName,
          CONTACT_PHONE_FIELD.fieldApiName,
          CONTACT_CREATED_DATE_FIELD.fieldApiName
        ];

      case "Opportunity":
        return [
          OPPORTUNITY_ID_FIELD.fieldApiName,
          OPPORTUNITY_NAME_FIELD.fieldApiName,
          OPPORTUNITY_ACCOUNT_ID_FIELD.fieldApiName,
          OPPORTUNITY_STAGE_NAME_FIELD.fieldApiName,
          OPPORTUNITY_CLOSE_DATE_FIELD.fieldApiName,
          OPPORTUNITY_CREATED_DATE_FIELD.fieldApiName
        ];

      case "Case":
        return [
          CASE_ID_FIELD.fieldApiName,
          CASE_CASE_NUMBER_FIELD.fieldApiName,
          CASE_ORIGIN_FIELD.fieldApiName,
          CASE_ACCOUNT_ID_FIELD.fieldApiName,
          CASE_CONTACT_ID_FIELD.fieldApiName,
          CASE_CREATED_DATE_FIELD.fieldApiName
        ];

      default:
        return ["Id"];
    }
  }

  get columns() {
    switch (this.selectedObject) {
      case "Lead":
        return leadColumns;
      case "Account":
        return accountColumns;
      case "Contact":
        return contactColumns;
      case "Opportunity":
        return opportunityColumns;
      case "Case":
        return caseColumns;
      default:
        return [];
    }
  }

  connectedCallback() {
    this.isDisplaySpinner = true;

    getObjectsFields({ sObjectsApiNames: this.sObjects })
      .then((response) => {
        this.sObjectFields = response;
      })
      .catch((error) => {
        this.handleNotification("Error", error.body.message, "error");
      })
      .finally(() => {
        this.isDisplaySpinner = false;
      });
  }

  handleElementChange(event) {
    const { name, value } = event.target;

    if (name === "sObjectFields") {
      this.selectedObjectFields = value;
    } else if (name === "sObjectSelection") {
      this.selectedObject = value;
      this.getSelectedObjectFields();
    } else if (name === "csvFileName") {
      this.csvFileName = value;
    }
  }

  handleDataExporting() {
    this.isDisplaySpinner = true;

    try {
      let sObjectFieldsApiNames = this.selectedObjectFields.toString();

      if (sObjectFieldsApiNames.includes("AccountId")) {
        sObjectFieldsApiNames += ",Account.Name";
      }
      if (sObjectFieldsApiNames.includes("ContactId")) {
        sObjectFieldsApiNames += ",Contact.Name";
      }

      getsObjectRecords({
        sObjectApiName: this.selectedObject,
        sObjectFieldsApiNames
      })
        .then((response) => {
          const responseResult = JSON.parse(
            JSON.stringify(JSON.parse(response))
          );

          if (responseResult) {
            if (
              this.selectedObject === "Lead" ||
              this.selectedObject === "Account"
            ) {
              this.sObjectRecords = responseResult.map((record) => {
                return {
                  ...record,
                  createdDate__js: this.getFormattedDate(
                    new Date(record.CreatedDate)
                  )
                };
              });
            } else if (
              this.selectedObject === "Contact" ||
              this.selectedObject === "Opportunity"
            ) {
              this.sObjectRecords = responseResult.map((record) => {
                return {
                  ...record,
                  createdDate__js: this.getFormattedDate(
                    new Date(record.CreatedDate)
                  ),
                  accountName__js: record.Account.Name
                };
              });
            } else if (this.selectedObject === "Case") {
              this.sObjectRecords = responseResult.map((record) => {
                return {
                  ...record,
                  createdDate__js: this.getFormattedDate(
                    new Date(record.CreatedDate)
                  ),
                  accountName__js: record.Account.Name,
                  contactName__js: record.Contact.Name
                };
              });
            }
          }

          if (this.sObjectRecords?.length > 0) {
            this.isDisplayFetchFields = false;
            this.isDisplayFetchRecords = true;
          }
        })
        .catch((error) => {
          this.handleNotification("Error", error.body.message, "error");
        })
        .finally(() => {
          this.isDisplaySpinner = false;
        });
    } catch (error) {
      this.isDisplaySpinner = false;
      this.handleNotification("Error", error, "error");
    }
  }

  handleExportDataInCSV() {
    if (this.sObjectRecords.length > 0) {
      this.isDisplayFolderModal = true;
    } else {
      this.handleNotification(
        "ERROR",
        "No records available for download...",
        "error"
      );
    }
  }

  handleCloseModal() {
    this.csvFileName = null;
    this.isDisplayFolderModal = false;
  }

  handleDownloadCSVFile() {
    if (!this.handleValidation()) {
      return;
    }

    this.isDisplaySpinner = true;

    try {
      let csvString = "";

      const headers = this.selectedObjectFields ?? [];

      // splitting headers using ','
      csvString += headers.join(",") + rowEnd;

      this.sObjectRecords.forEach((record) => {
        const row = headers.map((key) => {
          return `"${record[key] ?? ""}"`;
        });

        csvString += row.join(",") + rowEnd;
      });

      // create an anchor element <a> for download
      const downloadElement = document.createElement("a");

      // this encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters)
      downloadElement.href =
        "data:text/csv;charset=utf-8," + encodeURI(csvString);

      // target to open in new tab
      downloadElement.target = "_self";

      // CSV File Name
      downloadElement.download = `${this.csvFileName}.csv`;

      // below statement is required if you are using firefox browser
      document.body.appendChild(downloadElement);

      // click(), a JavaScript function to download CSV file
      downloadElement.click();

      document.body.removeChild(downloadElement);

      this.isDisplayFolderModal = false;
      this.handleRefreshComponent();

      this.isDisplaySpinner = false;
    } catch (error) {
      this.isDisplaySpinner = false;
      this.handleNotification("ERROR", error, "error");
    }
  }

  handleRefreshComponent() {
    this.csvFileName = null;
    this.selectedObject = null;
    this.sObjectFieldsOptions = [];
    this.sObjectRecords = [];

    this.isDisplayFetchFields = false;
    this.isDisplayFetchRecords = false;
    this.isDisplayFolderModal = false;
  }

  handleValidation() {
    return [...this.template.querySelectorAll("lightning-input")].reduce(
      (validaSoFar, inputField) => {
        inputField.reportValidity();
        return validaSoFar && inputField.checkValidity();
      },
      true
    );
  }

  handleNotification(title, message, variant, mode = "dismissable") {
    this.dispatchEvent(
      new ShowToastEvent({
        title,
        message,
        variant,
        mode
      })
    );
  }

  getFormattedDate(createdDate) {
    return `${this.getTwoDigitValue(createdDate.getMonth() + 1)}/${this.getTwoDigitValue(createdDate.getDate())}/${createdDate.getFullYear()}, ${this.getTwoDigitValue(createdDate.getHours())}:${this.getTwoDigitValue(createdDate.getMinutes())} ${createdDate.getHours() >= 12 ? "PM" : "AM"}`;
  }

  getTwoDigitValue(value) {
    return value?.toString().padStart(2, "0") ?? "";
  }

  getSelectedObjectFields() {
    const matchedItem = this.sObjectFields.filter(
      (item) => item.sObjectName === this.selectedObject
    )[0];

    if (matchedItem) {
      this.sObjectFieldsOptions = matchedItem.sObjectFields;
      this.isDisplayFetchFields = true;
    } else {
      this.handleNotification(
        "Error",
        "Sorry, selected Object doesn't exist",
        "error"
      );
    }
  }
}
