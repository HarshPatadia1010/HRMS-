import { LightningElement, wire, track, api } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import userId from '@salesforce/user/Id'; // Fetches the current user's Id

export default class JobResults extends NavigationMixin(LightningElement) {
    allJobs = [];
    @track filteredJobs = [];
    searchTitle = '';
    searchLocation = '';
    searchMode = '';
    @api campaignId = '';
    @track currentUserId = userId;

    connectedCallback() {
        console.log('Initial Campaign ID:', this.campaignId);
    }

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            const params = new URLSearchParams(window.location.search);
            this.searchTitle = params.get('title') || '';
            this.searchLocation = params.get('location') || '';
            this.searchMode = params.get('mode') || '';
            const urlCampaignId = params.get('campaignId') || '';
            if (urlCampaignId) {
                this.campaignId = urlCampaignId;
                console.log('Campaign ID from URL:', this.campaignId);
            }
        }
    }

    @wire(getActiveCampaigns)
    wiredJobs({ error, data }) {
        if (data) {
            this.allJobs = data;
            this.filterJobs();
        } else if (error) {
            console.error('Error fetching jobs:', error);
        }
    }

    filterJobs() {
        this.filteredJobs = this.allJobs.filter(job =>
            (this.searchTitle ? job.Name.toLowerCase().includes(this.searchTitle.toLowerCase()) : true) &&
            (this.searchLocation ? job.Job_Location__c?.toLowerCase().includes(this.searchLocation.toLowerCase()) : true) &&
            (this.searchMode ? job.Job_Mode__c === this.searchMode : true)
        );
    }

    handleApply(event){
        if (this.currentUserId) {
            // User is logged in, proceed to question form
            console.log('User is logged in, navigating to question form');
            
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

    handleCampaignClick(event) {
        const campaignId = event.currentTarget.dataset.id;
        this.campaignId = campaignId;
        console.log('Job title clicked - Campaign ID:', campaignId);
        
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/description?campaignId=${campaignId}`
            }
        });
    }
}