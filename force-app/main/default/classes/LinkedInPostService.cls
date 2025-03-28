public class LinkedInPostService {
    private static final String LINKEDIN_POST_ENDPOINT = 'callout:LinkedInNameCredential/rest/posts';

    @InvocableMethod(label='Post to LinkedIn' description='Posts a message to LinkedIn from Flow')
    public static void postToLinkedInFlow(List<PostRequest> requests) {
        for (PostRequest req : requests) {
            postToLinkedIn(req.title, req.description);
        }
    }

    public static HttpResponse postToLinkedIn(String title, String description) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(LINKEDIN_POST_ENDPOINT);
        req.setMethod('POST');

        // Set required headers
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('LinkedIn-Version', '202503');

        // Prepare request body
        String requestBody = createPostPayload(title + ' ' + description, 'urn:li:person:S5UOT4iowm');
        req.setBody(requestBody);

        // Send request
        Http http = new Http();
        HttpResponse response;
        try {
            response = http.send(req);
            System.debug('LinkedIn Post Response Status: ' + response.getStatusCode());
            System.debug('LinkedIn Post Response Body: ' + response.getBody());
            return response;
        } catch (Exception e) {
            System.debug('Error posting to LinkedIn: ' + e.getMessage());
            throw e;
        }
    }

    private static String createPostPayload(String content, String authorUrn) {
        Map<String, Object> postMap = new Map<String, Object>();
        postMap.put('author', authorUrn);
        postMap.put('commentary', content);
        postMap.put('visibility', 'PUBLIC');
        postMap.put('lifecycleState', 'PUBLISHED');
        postMap.put('isReshareDisabledByAuthor', false);

        Map<String, Object> distributionMap = new Map<String, Object>();
        distributionMap.put('feedDistribution', 'MAIN_FEED');
        distributionMap.put('targetEntities', new List<String>());
        distributionMap.put('thirdPartyDistributionChannels', new List<String>());

        postMap.put('distribution', distributionMap);
        return JSON.serialize(postMap);
    }

    // Wrapper class to accept input from Flow
    public class PostRequest {
        @InvocableVariable(label='Title' required=true)
        public String title;

        @InvocableVariable(label='Description' required=true)
        public String description;
    }
}