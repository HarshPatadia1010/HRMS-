import { LightningElement, api, track, wire } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionController.getQuestions';
import saveAnswers from '@salesforce/apex/QuestionController.saveAnswers';
import saveFile from '@salesforce/apex/QuestionController.saveFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';

export default class Hrms_question_form extends LightningElement {
    @api campaignId;
    @track questions = [];
    @track answers = {};
    @track FirstName = '';
    @track LastName = '';
    @track Email = '';
    @track Phone = '';
    @track currentStep = 1;
    @track errors = {};
    fileData;


    get options() {
        return [
            { label: 'YES', value: 'YES' },
            { label: 'NO', value: 'NO' },
        ];
    }

    //connectedCallback() {
        // console.log('Question Form - Connected Callback');
        // console.log('Campaign ID from API:', this.campaignId);
        // console.log('Current URL:', window.location.href);
        
        // // Get campaign ID from URL parameters
        // const urlParams = new URLSearchParams(window.location.search);
        // const urlCampaignId = urlParams.get('campaignId');
        // console.log('Campaign ID from URL:', urlCampaignId);
        
        // if (urlCampaignId) {
        //     this.campaignId = urlCampaignId;
        //     console.log('Using Campaign ID from URL:', this.campaignId);
        // } else {
        //     console.log('No Campaign ID in URL, using API value:', this.campaignId);
        // }
  //  }
  connectedCallback() {
    console.log('Question Form - Connected Callback');
    console.log('Campaign ID from API:', this.campaignId);
    console.log('Current URL:', window.location.href);
    
    // Get campaign ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlCampaignId = urlParams.get('campaignId');
    console.log('Campaign ID from URL:', urlCampaignId);
    
    if (urlCampaignId) {
        this.campaignId = urlCampaignId;
        console.log('Using Campaign ID from URL:', this.campaignId);

        // ✅ Now load the questions
        this.loadQuestions(); 
    } else if (this.campaignId) {
        // ✅ Also load questions if campaignId was passed via @api
        console.log('No Campaign ID in URL, using API value:', this.campaignId);
        this.loadQuestions(); 
    } else {
        console.error('No campaignId available to fetch questions.');
    }
}

    renderedCallback() {
        console.log('Question Form - Rendered Callback');
        console.log('Current Campaign ID:', this.campaignId);
    }

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            console.log('Page Reference:', pageRef);
            console.log('Current URL in wire:', window.location.href);
            
            // Get campaign ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const urlCampaignId = urlParams.get('campaignId');
            console.log('Campaign ID from URL in wire:', urlCampaignId);
            
            if (urlCampaignId) {
                this.campaignId = urlCampaignId;
                console.log('Updated Campaign ID from URL in wire:', this.campaignId);
            }
        }
    }   

    // @wire(getQuestions, { campaignId: '$campaignId' })
    // wiredQuestions({ error, data }) {
    //     console.log('Wire service called with Campaign ID:', this.campaignId);
        
    //     if (data) {
    //         console.log('Questions loaded:', data);
    //         this.questions = data;
    //     } else if (error) {
    //         console.error('Error loading questions:', error);
    //         console.log('Campaign ID used for query:', this.campaignId);
    //         this.showToast('Error', 'Failed to load questions.', 'error');
    //     }
    // }

    // Getters for step visibility
   
    loadQuestions() {
        if (!this.campaignId) {
            console.error('No campaign ID available to fetch questions.');
            return;
        }
    
        getQuestions({ campaignId: this.campaignId })
            .then(data => {
                console.log('Questions loaded:', data);
                this.questions = data;
            })
            .catch(error => {
                console.error('Error loading questions:', error);
                this.showToast('Error', 'Failed to load questions.', 'error');
            });
    }
    






   
    get isStep1() {
        return this.currentStep === 1;
    }

    get isStep2() {
        return this.currentStep === 2;
    }

    get isStep3() {
        return this.currentStep === 3;
    }

    // Getters for step classes
    get stepClass1() {
        return this.getStepClass(1);
    }

    get stepClass2() {
        return this.getStepClass(2);
    }

    get stepClass3() {
        return this.getStepClass(3);
    }

    get isFirstStep() {
        return this.currentStep === 1;
    }

    get isLastStep() {
        return this.currentStep === 3;
    }

    get nextButtonLabel() {
        return this.isLastStep ? 'Submit' : 'Next';
    }

    get isNextDisabled() {
        if (this.currentStep === 1) {
            return !this.validateStep1();
        } else if (this.currentStep === 2) {
            return !this.fileData;
        } else if (this.currentStep === 3) {
            return !this.validateStep3();
        }
        return false;
    }

    getStepClass(step) {
        let baseClass = 'step-indicator';
        if (step === this.currentStep) {
            return `${baseClass} step-active`;
        } else if (step < this.currentStep) {
            return `${baseClass} step-completed`;
        }
        return baseClass;
    }

    // Handle personal details input
    handlePersonalInputChange(event) {
        const field = event.target.name;
        const value = event.target.value.trim();
    
        if (field === 'First_Name') {
            this.FirstName = value;
        } else if (field === 'Last_Name') {
            this.LastName = value;
        } else if (field === 'Email') {
            this.Email = value;
        } else if (field === 'Phone') {
            this.Phone = value;
        }

        // Clear error for this field if it exists
        if (this.errors[field]) {
            delete this.errors[field];
        }
    }

    // Handle dynamic question responses
    handleDynamicInputChange(event) {
        const questionId = event.target.dataset.id;
        this.answers[questionId] = event.target.value;
        
        // Clear error for this question if it exists
        if (this.errors[questionId]) {
            delete this.errors[questionId];
        }
    }

    // Handle file selection and convert to Base64
    handleFileChange(event) {
        if (event.target.files.length > 0) {
            let file = event.target.files[0];
            if (file.size > 5000000) { // 5MB limit
                this.showToast('Error', 'File size cannot exceed 5MB.', 'error');
                return;
            }
            let reader = new FileReader();
            reader.onload = () => {
                let base64 = reader.result.split(',')[1];
                this.fileData = {
                    filename: file.name,
                    base64: base64
                };
            };
            reader.readAsDataURL(file);
        }
    }

    // Validation methods
    validateStep1() {
        return this.FirstName && this.LastName && this.Email && this.Phone;
    }

    validateStep3() {
        if (!this.questions || this.questions.length === 0) return true;
        return this.questions.every(question => this.answers[question.Id]);
    }

    // Navigation methods
    handleNext() {
        if (this.currentStep === 3) {
            this.handleSubmit();
        } else {
            this.currentStep++;
        }
    }

    handlePrevious() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    // Handle form submission
    handleSubmit() {
        if (!this.validateStep1()) {
            this.currentStep = 1;
            this.showToast('Error', 'Please complete all personal details.', 'error');
            return;
        }

        if (!this.fileData) {
            this.currentStep = 2;
            this.showToast('Error', 'Please upload your resume.', 'error');
            return;
        }

        if (!this.validateStep3()) {
            this.currentStep = 3;
            this.showToast('Error', 'Please answer all questions.', 'error');
            return;
        }

        saveAnswers({ 
            questionAnswers: this.answers, 
            firstName: this.FirstName, 
            lastName: this.LastName, 
            email: this.Email, 
            phone: this.Phone, 
            campaignId: this.campaignId 
        })
        .then((leadId) => {
            // Upload file
            return saveFile({ 
                fileName: this.fileData.filename, 
                base64Data: this.fileData.base64, 
                recordId: leadId 
            });
        })
        .then(() => {
            this.showToast('Success', 'Application submitted successfully!', 'success');
            this.clearForm();
            this.dispatchEvent(new CustomEvent('applicationsubmitted'));
        })
        .catch(error => {
            console.error('Error submitting application:', error);
            this.showToast('Error', 'Failed to submit application. Please try again.', 'error');
        });
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

    clearForm() {
        this.FirstName = '';
        this.LastName = '';
        this.Email = '';
        this.Phone = '';
        this.answers = {};
        this.fileData = null;
        this.currentStep = 1;
        this.errors = {};
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('backbtnclick'));
    }
}