import { LightningElement, wire,api } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';

export default class Hrms_list_container extends LightningElement {
    @api campaigns;
    @api error;
     isListVisible=true;
    @api selectedCampaignId;
    @wire(getActiveCampaigns)
    wiredCampaigns({ error, data }) {
        if (data) {
            this.campaigns = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.campaigns = undefined;
        }
    }

    handleCampaignClick(event) {
        const campaignId = event.currentTarget.dataset.id;
        this.selectedCampaignId=campaignId;
        console.log('Clicked Campaign ID:', campaignId);
        // console.log('selectedCampaign ID:',this.selectedCampaignId);
        this.isListVisible = false;

        // This will be used in the next step to open the detailed page
    }
    //child function for custom event
    backToList(){
        this.isListVisible = true;
    }
}