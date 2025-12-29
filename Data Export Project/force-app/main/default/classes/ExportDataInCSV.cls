public without sharing class ExportDataInCSV {

  @AuraEnabled(cacheable=true)
  public static String getsObjectRecords(
    String sObjectApiName,
    String sObjectFieldsApiNames
  ) {
    if (
      String.IsBlank(sObjectApiName) && String.IsBlank(sObjectFieldsApiNames)
    ) {
      return '';
    }

    try {
      String query = 'SELECT ';
      if (sObjectFieldsApiNames.contains('Id')) {
        query += sObjectFieldsApiNames;
      } else {
        query += 'Id, ' + sObjectFieldsApiNames;
      }
      query += ' FROM ' + sObjectApiName;

      String serializeRecords = JSON.serialize(Database.query(query));

      Integer sizeInBytes = Blob.valueOf(serializeRecords).size();

      // 5.5 MB safety buffer (limit is ~6 MB)
      if (sizeInBytes > 5500000) {
        throw new AuraHandledException(
          'Size exceeds 5.5MB, reduce the number of records or fields.'
        );
      }

      return serializeRecords;
    } catch (AuraHandledException ahe) {
      throw ahe; // rethrow as-is
    } catch (Exception exp) {
      throw new AuraHandledException(exp.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<ObjectsFeilds> getObjectsFields(
    List<String> sObjectsApiNames
  ) {
    List<ObjectsFeilds> fieldDetails = new List<ObjectsFeilds>();

    if (!sObjectsApiNames.isEmpty()) {
      for (String objectApiName : sObjectsApiNames) {
        fieldDetails.add(
          new ObjectsFeilds(objectApiName, fetchsObjectFields(objectApiName))
        );
      }
    }

    return fieldDetails;
  }

  static List<Constants.LabelByValue> fetchsObjectFields(
    String sObjectApiName
  ) {
    List<Constants.LabelByValue> fieldDetails = new List<Constants.LabelByValue>();
    Set<String> unwantedFields = unwantedFields();

    try {
      Map<String, Schema.sObjectField> sObjectFields = Schema.getGlobalDescribe()
        .get(sObjectApiName)
        .getDescribe()
        .fields.getMap();
      for (String fieldName : sObjectFields.keySet()) {
        Schema.DescribeFieldResult field = sObjectFields.get(fieldName)
          .getDescribe();
        if (!unwantedFields.contains(field.getName())) {
          fieldDetails.add(
            new Constants.LabelByValue(field.getName(), field.getName())
          );
        }
      }

      return fieldDetails;
    } catch (Exception exp) {
      throw new AuraHandledException(exp.getMessage());
    }
  }

  static Set<String> unwantedFields() {
    return new Set<String>{
      'MasterRecordId',
      'BillingGeocodeAccuracy',
      'BillingLatitude',
      'BillingLongitude',
      'SystemModstamp',
      'Site',
      'JigsawCompanyId',
      'Jigsaw',
      'ChannelProgramLevelName',
      'ChannelProgramName',
      'AccountSource',
      'DunsNumber',
      'Tradestyle',
      'NaicsCode',
      'NaicsDesc',
      'YearStarted',
      'Sic',
      'SicDesc',
      'DandbCompanyId',
      'OperatingHoursId',
      'JigsawContactId',
      'IsDeleted',
      'OtherLatitude',
      'OtherLongitude',
      'OtherGeocodeAccuracy',
      'HasOptedOutOfEmail',
      'HasOptedOutOfFax',
      'DoNotCall',
      'LastCURequestDate',
      'LastCUUpdateDate',
      'EmailBouncedReason',
      'EmailBouncedDate',
      'IsEmailBounced',
      'PhotoUrl',
      'Latitude',
      'Longitude',
      'GeocodeAccuracy',
      'CompanyDunsNumber',
      'IndividualId',
      'SuppliedName',
      'SuppliedEmail',
      'SuppliedPhone',
      'SuppliedCompany'
    };
  }

  public class ObjectsFeilds {
    @AuraEnabled
    public String sObjectName;
    @AuraEnabled
    public List<Constants.LabelByValue> sObjectFields;

    public ObjectsFeilds(
      String sObjectName,
      List<Constants.LabelByValue> sObjectFields
    ) {
      this.sObjectName = sObjectName;
      this.sObjectFields = sObjectFields;
    }
  }
}
