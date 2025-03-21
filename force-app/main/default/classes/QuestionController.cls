public class QuestionController {
    @AuraEnabled
    public static List<Questions__c> getQuestions(Id campaignId) {
        return [
            SELECT Id, question_text__c, Answer__c
            FROM Questions__c
            WHERE Campaing__c = :campaignId
        ];
    }

    @AuraEnabled
    public static void saveAnswers(Map<Id, String> questionAnswers) {
        List<Questions__c> questionsToUpdate = new List<Questions__c>();
        
        for (Id questionId : questionAnswers.keySet()) {
            Questions__c question = new Questions__c(Id = questionId, Answer__c = questionAnswers.get(questionId));
            questionsToUpdate.add(question);
        }

        update questionsToUpdate;
    }

}