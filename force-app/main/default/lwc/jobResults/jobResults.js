import { LightningElement, track, api } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';
import { NavigationMixin } from 'lightning/navigation';
import userId from '@salesforce/user/Id';

export default class JobResults extends NavigationMixin(LightningElement) {
    @track allJobs = [];
    @track filteredJobs = [];
    @api campaignId = '';
    searchTitle = '';
    searchLocation = '';
    searchMode = '';
    currentUserId = userId;

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        this.searchTitle = params.get('title') || '';
        this.searchLocation = params.get('location') || '';
        this.searchMode = params.get('mode') || '';
        const urlCampaignId = params.get('campaignId') || '';
        if (urlCampaignId) {
            this.campaignId = urlCampaignId;
        }

        this.fetchCampaigns();
    }

    async fetchCampaigns() {
        try {
            const result = await getActiveCampaigns();
            const parsed = JSON.parse(result);
            const campaigns = parsed.records;
            this.allJobs = campaigns;
            this.filterJobs();
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    }

    filterJobs() {
        this.filteredJobs = this.allJobs.filter(job =>
            (this.searchTitle ? job.Name.toLowerCase().includes(this.searchTitle.toLowerCase()) : true) &&
            (this.searchLocation ? job.Job_Location__c?.toLowerCase().includes(this.searchLocation.toLowerCase()) : true) &&
            (this.searchMode ? job.Job_Mode__c === this.searchMode : true)
        );
    }

    handleApply(event) {
        if (this.currentUserId) {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/application-form?campaignId=${this.campaignId}`
                }
            });
        } else {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/login?returnUrl=/description?campaignId=${this.campaignId}`
                }
            });
        }
    }

    handleCampaignClick(event) {
        const campaignId = event.currentTarget.dataset.id;
        this.campaignId = campaignId;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/description?campaignId=${campaignId}`
            }
        });
    }
}