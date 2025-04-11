public with sharing class salesforceAPI {
    @AuraEnabled
    public static String getAccessToken() {
        String endpoint = 'https://login.salesforce.com/services/oauth2/token?';
        String grant_type = 'password';
        String username = 'salsforceproject.evoqtech@gmail.com';
        String password = 'Evoqtech@123g9DokZgaRulWtHNaDFs1AJ2O';
        String client_id = '3MVG9VMBZCsTL9hlHcTdW2Iuls1NfPposIchTM8oSvjAKyJ_3_4x2DaG_neEAHLw0S9GmfBgsU.vRMp0KRzn1';
        String client_secret = 'DD26D35CD7036B5A39E85DF8085D5A0020479ED8F94B527C771D990D9D71AEC4';

        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setBody(
            'grant_type=password' + 
            '&client_id=3MVG9VMBZCsTL9hlHcTdW2Iuls1NfPposIchTM8oSvjAKyJ_3_4x2DaG_neEAHLw0S9GmfBgsU.vRMp0KRzn1' + 
            '&client_secret=DD26D35CD7036B5A39E85DF8085D5A0020479ED8F94B527C771D990D9D71AEC4' + 
            '&username=salsforceproject.evoqtech@gmail.com' + 
            '&password=Evoqtech@123g9DokZgaRulWtHNaDFs1AJ2O'
        );
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        // Deserialization
        if(res.getStatusCode() == 200) {
            Wrapper w = (Wrapper) JSON.deserialize(res.getBody(), Wrapper.class);
            System.debug('access token: ' + w.access_token);
            System.debug('instance url: ' + w.instance_url);
            
            // Get campaign data
            String campaignData = getCampaign(w.access_token);
            return campaignData;
        } else {
            System.debug('Error: ' + res.getStatus());
            System.debug('Response Body: ' + res.getBody());
            return 'Error: ' + res.getStatus();
        }
    }
    
    public static String getCampaign(string access_token) {
        String endpoint = 'https://evoqtech2-dev-ed.develop.my.salesforce.com/services/data/v62.0/query/?q=SELECT+Id,Name,Job_Description__c,Education__c,Salary__c,Experience__c,Job_Mode__c,Description,StartDate,EndDate,Job_Location__c+FROM+Campaign';

        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + access_token);
        req.setEndpoint(endpoint);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if(res.getStatusCode() == 200) {
            System.debug('Campaign ' + res.getBody());
            return res.getBody();
        } else {
            System.debug('Error: ' + res.getStatus());
            return 'Error: ' + res.getBody();
        }
    }
    
    public class Wrapper {
         String access_token;
         String instance_url ;
        
        public Wrapper(String access_token) {
            // Default constructor for JSON deserialization
            this.access_token=access_token;
        }
    }
}