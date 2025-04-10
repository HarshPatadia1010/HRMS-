public with sharing class OnboardingFormController {
     @AuraEnabled
    public static String saveCandidate(Map<String, Object> candidateData) {
        try {
            // Create a new Candidate record
            Candidate__c candidate = new Candidate__c();
            
            // Set the fields from the form data with proper type conversion
            candidate.FirstName__c = (String)candidateData.get('FirstName__c');
            candidate.LastName__c = (String)candidateData.get('LastName__c');
            candidate.Email__c = (String)candidateData.get('Email__c');
            
            // Handle YearsOfExperience__c conversion
            Object yearsExp = candidateData.get('YearsOfExperience__c');
            if (yearsExp != null) {
                if (yearsExp instanceof String) {
                    candidate.YearsOfExperience__c = Decimal.valueOf((String)yearsExp);
                } else if (yearsExp instanceof Decimal) {
                    candidate.YearsOfExperience__c = (Decimal)yearsExp;
                }
            }
            
            candidate.CurrentCompany__c = (String)candidateData.get('CurrentCompany__c');
            candidate.CurrentRole__c = (String)candidateData.get('CurrentRole__c');
            candidate.HighestDegree__c = (String)candidateData.get('HighestDegree__c');
            candidate.University__c = (String)candidateData.get('University__c');
            
            // Handle GraduationYear__c conversion
            Object gradYear = candidateData.get('GraduationYear__c');
            if (gradYear != null) {
                if (gradYear instanceof String) {
                    candidate.GraduationYear__c = Decimal.valueOf((String)gradYear);
                } else if (gradYear instanceof Decimal) {
                    candidate.GraduationYear__c = (Decimal)gradYear;
                }
            }
            
            candidate.TechnicalSkills__c = (String)candidateData.get('TechnicalSkills__c');
            candidate.SoftSkills__c = (String)candidateData.get('SoftSkills__c');
            candidate.Certificates__c = (String)candidateData.get('Certificates__c');
            
            // Set the User lookup field to the current user
            candidate.User__c = UserInfo.getUserId();
            
            // Insert the candidate record
            insert candidate;
            
            return 'Success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Map<String, Object> getCandidate(String candidateId) {
        try {
            // Query the candidate record
            Candidate__c candidate = [
                SELECT Id, FirstName__c, LastName__c, Email__c, 
                       YearsOfExperience__c, CurrentCompany__c, CurrentRole__c,
                       HighestDegree__c, University__c, GraduationYear__c,
                       TechnicalSkills__c, SoftSkills__c, Certificates__c,
                       User__c
                FROM Candidate__c
                WHERE Id = :candidateId
                LIMIT 1
            ];
            
            // Convert the candidate record to a map
            Map<String, Object> candidateData = new Map<String, Object>{
                'FirstName__c' => candidate.FirstName__c,
                'LastName__c' => candidate.LastName__c,
                'Email__c' => candidate.Email__c,
                'YearsOfExperience__c' => candidate.YearsOfExperience__c,
                'CurrentCompany__c' => candidate.CurrentCompany__c,
                'CurrentRole__c' => candidate.CurrentRole__c,
                'HighestDegree__c' => candidate.HighestDegree__c,
                'University__c' => candidate.University__c,
                'GraduationYear__c' => candidate.GraduationYear__c,
                'TechnicalSkills__c' => candidate.TechnicalSkills__c,
                'SoftSkills__c' => candidate.SoftSkills__c,
                'Certificates__c' => candidate.Certificates__c,
                'User__c' => candidate.User__c
            };
            
            return candidateData;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}