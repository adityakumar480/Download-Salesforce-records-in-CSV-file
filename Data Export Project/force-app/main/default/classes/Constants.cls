public class Constants {
  
  public class LabelByValue {
    @AuraEnabled
    public String label { get; set; }
    @AuraEnabled
    public String value { get; set; }

    public LabelByValue(String label, String value) {
      this.label = label;
      this.value = value;
    }
  }
  
}
