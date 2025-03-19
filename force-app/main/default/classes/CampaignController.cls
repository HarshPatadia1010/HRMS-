public with sharing class CampaignController {
    @AuraEnabled(cacheable=true)
    public static List<Campaign> getActiveCampaigns() {
        return [SELECT Id, Name, Job_Description__c, Education__c, Salary__c, Experience__c, Job_Mode__c, Description,StartDate,EndDate,Job_Location__c
                FROM Campaign 
                WHERE IsActive = TRUE];
    }
}