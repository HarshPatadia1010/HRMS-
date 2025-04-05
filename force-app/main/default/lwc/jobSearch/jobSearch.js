import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

export default class JobSearch extends NavigationMixin(LightningElement) {
    @track searchTitle = '';
    @track searchLocation = '';
    @track searchMode = '';

    // Job Mode options
    jobModeOptions = [
        { label: 'All', value: '' },
        { label: 'Remote', value: 'Remote' },
        { label: 'Onsite', value: 'Onsite' },
        { label: 'Hybrid', value: 'Hybrid' }
    ];

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            const params = new URLSearchParams(window.location.search);
            this.searchTitle = params.get('title') || '';
            this.searchLocation = params.get('location') || '';
            this.searchMode = params.get('mode') || '';
        }
    }

    handleTitleChange(event) {
        this.searchTitle = event.target.value;
    }

    handleLocationChange(event) {
        this.searchLocation = event.target.value;
    }

    handleModeChange(event) {
        this.searchMode = event.target.value;
    }

    handleSearch() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/jobs?title=${encodeURIComponent(this.searchTitle)}&location=${encodeURIComponent(this.searchLocation)}&mode=${encodeURIComponent(this.searchMode)}`
            }
        });
    }
}