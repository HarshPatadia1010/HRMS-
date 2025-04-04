import { LightningElement, api, wire, track } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';
import CAMPAIGN_DESCRIPTION from '@salesforce/apex/CampaignDescription.getCampaignDescription';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import userId from '@salesforce/user/Id'; // Fetches the current user's Id

export default class Hrms_description extends NavigationMixin(LightningElement) {

    @api campaignid;
    @track campaign;
    @track currentUserId = userId;

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            const params = new URLSearchParams(window.location.search);
            const urlCampaignId = params.get('campaignId') || '';
            if (urlCampaignId) {
                this.campaignid = urlCampaignId;
                console.log('Campaign ID from URL in description component:', this.campaignid);
            }
        }
    }

    @wire(CAMPAIGN_DESCRIPTION, { campaignId: '$campaignid' })
    wiredCampaign({ data, error }) {
        if (data) {
            this.campaign = data;
            console.log('Campaign data loaded:', this.campaign);
        } else if (error) {
            console.error('Error fetching campaign details:', error);
        }
    }
    
    connectedCallback() {
        console.log('Description component initialized with Campaign ID:', this.campaignid);
        console.log('Current User ID:', this.currentUserId);
   
    }
    
  
    
    handleApply(event){
        if (this.currentUserId) {
            // User is logged in, proceed to question form
            console.log('User is logged in, navigating to question form');
            console.log('apply function camp id', this.campaignid);
            
             // Navigate to application-form page with return URL
             this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/application-form?campaignId=${this.campaignid}`
                }
                
                
                
                
                
            });
        } else {
            // User is not logged in, redirect to login page
            console.log('User is not logged in, redirecting to login page');
            this.showToast('Login Required', 'Please log in to apply for this job', 'warning');
             // Navigate to application-form page with return URL
             this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/login?returnUrl=/description?campaignId=${this.campaignid}`
                    
                }
            });
           
        }
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}