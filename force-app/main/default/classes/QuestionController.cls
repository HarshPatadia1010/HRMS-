public with sharing class QuestionController {
    @AuraEnabled
    public static List<Question__c> getQuestions(Id campaignId) {
        return [SELECT Id, question_text__c FROM Question__c WHERE Campaign__c = :campaignId ORDER BY CreatedDate ASC];
    }

    @AuraEnabled
    public static String saveAnswers(Map<String, Object> formData) {
        try {
            // Extract data from the formData map
            Map<String, String> answers = (Map<String, String>)formData.get('answers');
            Map<String, String> personalInfo = (Map<String, String>)formData.get('personalInfo');
            Id campaignId = (Id)formData.get('campaignId');
            
            // Create Applicant record
            Applicant__c applicant = new Applicant__c(
                First_Name__c = personalInfo.get('FirstName'),
                Last_Name__c = personalInfo.get('LastName'),
                Email__c = personalInfo.get('Email'),
                Phone__c = personalInfo.get('Phone'),
                Campaign__c = campaignId
            );
            insert applicant;

            // Create Answer records
            List<Answer__c> answerRecords = new List<Answer__c>();
            for(String questionId : answers.keySet()) {
                answerRecords.add(new Answer__c(
                    Question__c = questionId,
                    Answer_Text__c = answers.get(questionId),
                    Applicant__c = applicant.Id
                ));
            }
            insert answerRecords;

            // Handle file attachment if present
            if(formData.containsKey('fileData') && formData.get('fileData') != null) {
                Map<String, Object> fileData = (Map<String, Object>)formData.get('fileData');
                String fileName = (String)fileData.get('filename');
                String base64Content = (String)fileData.get('base64');

                ContentVersion cv = new ContentVersion();
                cv.VersionData = EncodingUtil.base64Decode(base64Content);
                cv.Title = fileName;
                cv.PathOnClient = fileName;
                insert cv;

                // Link the file to the applicant record
                ContentDocumentLink cdl = new ContentDocumentLink();
                cdl.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
                cdl.LinkedEntityId = applicant.Id;
                cdl.ShareType = 'V';
                insert cdl;
            }

            return applicant.Id;
        } catch(Exception e) {
            throw new AuraHandledException('Error saving application: ' + e.getMessage());
        }
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