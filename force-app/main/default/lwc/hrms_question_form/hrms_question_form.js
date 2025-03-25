import { LightningElement, api, track } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionController.getQuestions';
import saveAnswers from '@salesforce/apex/QuestionController.saveAnswers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Hrms_question_form extends LightningElement {
    @api recordId;
    @track questions = [];
    @track answers = {};
    @track FirstName = '';
    @track LastName = '';
    @track Email = '';
    @track Phone = '';

    connectedCallback() {
        this.loadQuestions();
    }

    // Fetch campaign-specific questions
    loadQuestions() {
        getQuestions({ campaignId: this.recordId })
            .then(result => {
                this.questions = result;
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
            });
    }

    // Handle personal details input
    handlePersonalInputChange(event) {
        const field = event.target.name;
        const value = event.target.value.trim(); // Trim spaces to avoid empty inputs
    
        if (field === 'First_Name') {
            this.FirstName = value;
        } else if (field === 'Last_Name') {
            this.LastName = value;
        } else if (field === 'Email') {
            this.Email = value;
        } else if (field === 'Phone') {
            this.Phone = value;
        }
    }
    

    // Handle dynamic question responses
    handleDynamicInputChange(event) {
        this.answers = { ...this.answers, [event.target.dataset.id]: event.target.value };
    }

    // Handle form submission
    handleSubmit() {
        console.log('First Name:', this.FirstName);
        console.log('Last Name:', this.LastName);
        console.log('Email:', this.Email);
        console.log('Phone:', this.Phone);
        console.log('Answers:', JSON.stringify(this.answers));
    
        // Check for missing personal details
        if (!this.FirstName || !this.LastName || !this.Email || !this.Phone) {
            this.showToast('Error', 'Please fill in all personal details.', 'error');
            return;
        }
    
        // Check if at least one question is answered
        if (!this.answers || Object.keys(this.answers).length === 0) {
            this.showToast('Error', 'No answers provided. Please fill out the form.', 'error');
            return;
        }
    
       /* const leadDetails = {
            FirstName: this.FirstName,
            LastName: this.LastName,
            Email: this.Email,
            Phone: this.Phone
        };*/
    
        saveAnswers({ questionAnswers: this.answers, firstName: this.FirstName,lastName: this.LastName,email:this.Email,phone:this.Phone, campaignId: this.recordId })
            .then(() => {
                this.showToast('Success', 'Application submitted successfully!', 'success');
                this.clearForm();
            })
            .catch(error => {
                this.showToast('Error', 'Failed to submit the application.', 'error');
                console.error('Error saving answers:', error);
            });
    }
    
    // Show toast notifications
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    // Clear form after submission
    clearForm() {
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(input => {
            input.value = '';
        });

        this.FirstName = '';
        this.LastName = '';
        this.Email = '';
        this.Phone = '';
        this.answers = {};
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('backbtnclick'));
    }
}