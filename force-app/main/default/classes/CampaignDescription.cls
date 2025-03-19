public with sharing class CampaignDescription {
    @AuraEnabled(cacheable=true)
    public static Campaign getCampaignDescription(Id campaignId) {
        return [
            SELECT Id, Name, Job_Description__c, Education__c, Salary__c, Experience__c, Job_Mode__c, Description,StartDate,EndDate,Job_Location__c
            FROM Campaign 
            WHERE Id = :campaignId
            LIMIT 1
        ];
    }
}