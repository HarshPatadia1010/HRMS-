import { LightningElement, wire, track } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';

export default class JobListing extends LightningElement {
    allJobs = [];
    @track filteredJobs = [];

    // @wire(getActiveCampaigns)
    // wiredJobs({ error, data }) {
    //     if (data) {
    //         this.allJobs = data;
    //         this.filteredJobs = data;
    //     } else if (error) {
    //         console.error('Error fetching jobs:', error);
    //     }
    // }
    connectedCallback() {
        this.loadCampaigns();
    }

    loadCampaigns() {
        getActiveCampaigns()
            .then((result) => {
                this.allJobs = result;
                this.filteredJobs = result;
            })
            .catch((error) => {
                console.error('Error fetching jobs:', error);
            });
    }

    handleSearch(event) {
        const { title, location } = event.detail;
        this.filteredJobs = this.allJobs.filter(job =>
            (title ? job.Name.toLowerCase().includes(title) : true) &&
            (location ? job.Job_Location__c?.toLowerCase().includes(location) : true)
        );
    }
    
}