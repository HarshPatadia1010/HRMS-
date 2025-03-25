public with sharing class QuestionController {
    @AuraEnabled
    public static List<Questions__c> getQuestions(Id campaignId) {
        return [
            SELECT Id, question_text__c
            FROM Questions__c
            WHERE Campaing__c = :campaignId
        ];
    }

    @AuraEnabled
    public static void saveAnswers(Map<Id, String> questionAnswers, String firstName, String lastName, String email, String phone, Id campaignId) {
        // Create a new lead
        
        System.debug('questionAnswers--'+questionAnswers);
        System.debug('firstName--'+firstName);
        System.debug('lastName--'+lastName);
        System.debug('email--'+email);
        System.debug('phone--'+phone);
        System.debug('campaignId--'+campaignId);
        
        Lead newLead = new Lead(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Campaign__c = campaignId,
            Company = 'Unspecified'
     
        );
        insert newLead;

        // Insert responses
        List<Response__c> responses = new List<Response__c>();
        for (Id questionId : questionAnswers.keySet()) {
            Response__c response = new Response__c(
                Question__c = questionId,
                Answer__c = questionAnswers.get(questionId),
                Lead__c = newLead.Id,  // Link response to Lead
                Campaign__c = campaignId // Link to Campaign
            );
            responses.add(response);
        }
        
        if (!responses.isEmpty()) {
            insert responses;
        }
    }
}