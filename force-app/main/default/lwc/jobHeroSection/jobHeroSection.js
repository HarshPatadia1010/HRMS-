import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class JobHeroSection extends NavigationMixin(LightningElement) {
    handleExploreJobs() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/jobs'
            }
        });
    }
}