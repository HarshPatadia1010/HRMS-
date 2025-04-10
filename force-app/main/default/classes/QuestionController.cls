public with sharing class QuestionController {
    @AuraEnabled(cacheable=true)
    public static List<Questions__c> getQuestions(Id campaignId) {
        return [
            SELECT Id, question_text__c
            FROM Questions__c
            WHERE Campaing__c = :campaignId
        ];
    }

    @AuraEnabled
    public static String saveAnswers(Map<Id, String> questionAnswers, String firstName, String lastName, String email, String phone, Id campaignId) {
        Lead newLead = new Lead(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Campaign__c = campaignId,
            Company = 'Unspecified'
        );
        insert newLead;

        List<Response__c> responses = new List<Response__c>();
        for (Id questionId : questionAnswers.keySet()) {
            responses.add(new Response__c(
                Question__c = questionId,
                Answer__c = questionAnswers.get(questionId),
                Lead__c = newLead.Id,
                Campaign__c = campaignId
            ));
        }
        if (!responses.isEmpty()) {
            insert responses;
        }

        return newLead.Id;
    }

    @AuraEnabled
    public static void saveFile(String fileName, String base64Data, String recordId) {
        ContentVersion contentVersion = new ContentVersion(
            Title = fileName,
            VersionData = EncodingUtil.base64Decode(base64Data),
            PathOnClient = fileName
        );
        insert contentVersion;

         // Fetch ContentDocumentId using SOQL
    ContentDocument contentDocument = [
        SELECT Id FROM ContentDocument WHERE Id IN 
        (SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id)
        LIMIT 1
    ];

        ContentDocumentLink link = new ContentDocumentLink(
            LinkedEntityId = recordId,
            ContentDocumentId = contentDocument.Id,
            ShareType = 'V',
            Visibility = 'AllUsers'
        );
        insert link;
    }
}