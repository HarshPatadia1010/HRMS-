import { LightningElement,api,wire,track } from 'lwc';
import getActiveCampaigns from '@salesforce/apex/CampaignController.getActiveCampaigns';
import CAMPAIGN_DESCRIPTION from '@salesforce/apex/CampaignDescription.getCampaignDescription';
export default class Hrms_description extends LightningElement {

    @api campaignid;
    @track campaign;

    @wire(CAMPAIGN_DESCRIPTION, { campaignId: '$campaignid' })
    wiredCampaign({ data, error }) {
        if (data) {
            this.campaign = data;
            console.log('Campaign ',this.campaign);
        } else if (error) {
            console.error('Error fetching campaign details:', error);
        }
    }
    connectedCallback() {
        console.log('Campaign ID:', this.campaignid);
        console.log('Campaign ',this.campaign);
    }
    handleBackbtn(event){
        this.dispatchEvent(new CustomEvent('backbtnclick'));
    }
    handleApply(event){
        this.dispatchEvent(new CustomEvent('applybtnclick',{detail:{campaignId:this.campaignid}}));
        //const applyEvent = new CustomEvent('applybtnclick',{detail:{campaignId:this.campaignid}});
        //this.dispatchEvent(applyEvent);
    }
}