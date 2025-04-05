import { LightningElement, api, wire, track } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';
import CAMPAIGN_DESCRIPTION from '@salesforce/apex/CampaignDescription.getCampaignDescription';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import userId from '@salesforce/user/Id'; // Fetches the current user's Id

export default class Hrms_description extends NavigationMixin(LightningElement) {

    @api campaignId;
    @track campaign;
    @track currentUserId = userId;

    connectedCallback() {
        console.log('Description component initialized');
        console.log('Campaign ID from API:', this.campaignId);
        console.log('Current URL:', window.location.href);
    }

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            console.log('Page Reference:', pageRef);
            const params = new URLSearchParams(window.location.search);
            const urlCampaignId = params.get('campaignId');
            console.log('Campaign ID from URL:', urlCampaignId);
            
            if (urlCampaignId) {
                this.campaignId = urlCampaignId;
                console.log('Updated Campaign ID from URL:', this.campaignId);
            }
        }
    }

    @wire(CAMPAIGN_DESCRIPTION, { campaignId: '$campaignId' })
    wiredCampaign({ data, error }) {
        console.log('Wire service called with Campaign ID:', this.campaignId);
        
        if (data) {
            this.campaign = data;
            console.log('Campaign data loaded:', this.campaign);
        } else if (error) {
            console.error('Error fetching campaign details:', error);
            this.showToast('Error', 'Failed to load campaign details', 'error');
        }

    }
    
    handleApply(event){
        console.log('Apply button clicked');
        console.log('Current Campaign ID:', this.campaignId);
        
        if (this.currentUserId) {
            // User is logged in, proceed to question form
            console.log('User is logged in, navigating to question form');
            this.dispatchEvent(new CustomEvent('applybtnclick', {
                detail: { campaignId: this.campaignId }
            }));
             // Navigate to application-form page with return URL
             this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/application-form?returnUrl=/description?campaignId=${this.campaignId}`
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
                    url: `/login?returnUrl=/description?campaignId=${this.campaignId}`
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
