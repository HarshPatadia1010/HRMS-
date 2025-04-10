import { LightningElement, api, track, wire } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionController.getQuestions';
import saveAnswers from '@salesforce/apex/QuestionController.saveAnswers';
import saveFile from '@salesforce/apex/QuestionController.saveFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';

export default class Hrms_question_form extends LightningElement {
    @api recordId;
    @track questions = [];
    @track answers = {};
    @track FirstName = '';
    @track LastName = '';
    @track Email = '';
    @track Phone = '';
    @track currentStep = 1;
    @track errors = {};
    @track campaignId;
    fileData;
     

    get options() {
        return [
            { label: 'YES', value: 'YES' },
            { label: 'NO', value: 'NO' },
        ];
    }
    connectedCallback() {
        // Try to get campaign ID from URL first
        const urlParams = new URLSearchParams(window.location.search);
        const urlCampaignId = urlParams.get('campaignId');
        
        if (urlCampaignId) {
            this.campaignId = urlCampaignId;
            console.log('Campaign ID from URL:', this.campaignId);
        } else if (this.recordId) {
            this.campaignId = this.recordId;
            console.log('Campaign ID from recordId:', this.campaignId);
        }
    }

    @wire(CurrentPageReference)
    getPageRef(pageRef) {
        if (pageRef) {
            const params = new URLSearchParams(window.location.search);
            const urlCampaignId = params.get('campaignId');
            
            if (urlCampaignId) {
                this.campaignId = urlCampaignId;
                console.log('Campaign ID from URL in wire:', this.campaignId);
            } else if (this.recordId && !this.campaignId) {
                this.campaignId = this.recordId;
                console.log('Campaign ID from recordId in wire:', this.campaignId);
            }
        }
    }

    @wire(getQuestions, { campaignId: '$campaignId' })
    wiredQuestions({ error, data }) {
        if (data) {
            console.log('Questions loaded:', data);
            this.questions = data;
        } else if (error) {
            console.error('Error loading questions:', error);
            console.log('Campaign ID used for query:', this.campaignId);
            this.showToast('Error', 'Failed to load questions.', 'error');
        }
    }

    // Getters for step visibility
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