import { LightningElement, wire, track, api } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

export default class JobResults extends NavigationMixin(LightningElement) {
    allJobs = [];
    @track filteredJobs = [];
    searchTitle = '';
    searchLocation = '';
    @api campaignId = '';
    
    connectedCallback() {
        console.log('Initial Campaign ID:', this.campaignId);
    }

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            const params = new URLSearchParams(window.location.search);
            this.searchTitle = params.get('title') || '';
            this.searchLocation = params.get('location') || '';
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
            (this.searchLocation ? job.Job_Location__c?.toLowerCase().includes(this.searchLocation.toLowerCase()) : true)
        );
    }
    
    handleApply(event) {
        const campaignId = event.currentTarget.dataset.id;
        this.campaignId = campaignId;
        console.log('Apply clicked - Campaign ID:', campaignId);
        
        // Navigate to the application form
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/job-application?campaignId=${campaignId}`
            }
        });
    }
    
    handleCampaignClick(event) {
        const campaignId = event.currentTarget.dataset.id;
        this.campaignId = campaignId;
        console.log('Job title clicked - Campaign ID:', campaignId);
        
        // Navigate to the job description page with the campaign ID
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/description?campaignId=${campaignId}`
            }
        });
    }
}