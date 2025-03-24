public with sharing class QuestionController {
    @AuraEnabled
    public static List<Questions__c> getQuestions(Id campaignId) {
        return [
            SELECT Id, question_text__c
            FROM Questions__c
            WHERE Campaing__c = :campaignId
        ];
    }
/*
    @AuraEnabled
    public static void saveAnswers(Map<Id, String> questionAnswers) {
        List<Questions__c> questionsToUpdate = new List<Questions__c>();
        
        for (Id questionId : questionAnswers.keySet()) {
            Questions__c question = new Questions__c(Id = questionId, Answer__c = questionAnswers.get(questionId));
            questionsToUpdate.add(question);
        }

        update questionsToUpdate;
    }
        */
    @AuraEnabled
    public static void saveAnswers(Map<Id, String> questionAnswers, Lead leadDetails, Id campaignId) {
        //insert leadDetails
        insert leadDetails;

        //insert response
        List<Response__c> responses = new List<Response__c>();
        for (Id questionId : questionAnswers.keySet()) {
            Response__c response = new Response__c(
                Question__c = questionId,
                Answer__c = questionAnswers.get(questionId),
                Lead__c = leadDetails.Id,
                Campaign__c = campaignId
            );
            responses.add(response);
        }
        insert responses;

}
}