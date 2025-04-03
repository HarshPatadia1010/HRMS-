import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

export default class JobSearch extends NavigationMixin(LightningElement) {
    @track searchTitle = '';
    @track searchLocation = '';

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            const params = new URLSearchParams(window.location.search);
            this.searchTitle = params.get('title') || '';
            this.searchLocation = params.get('location') || '';
        }
    }

    handleTitleChange(event) {
        this.searchTitle = event.target.value;
    }

    handleLocationChange(event) {
        this.searchLocation = event.target.value;
    }

    handleSearch() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/jobs?title=${encodeURIComponent(this.searchTitle)}&location=${encodeURIComponent(this.searchLocation)}`
            }
        });
    }
}