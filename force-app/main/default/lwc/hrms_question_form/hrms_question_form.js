import { LightningElement, api, track } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionController.getQuestions';
import saveAnswers from '@salesforce/apex/QuestionController.saveAnswers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Hrms_question_form extends LightningElement {
    @api recordId;
    @track questions = [];
    @track answers = {}; // Ensure this is defined to avoid undefined errors
    @track FirstName;
    @track LastName;
    @track Email;
    @track Phone;

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

    // Handle input for personal details
    handlePersonalInputChange(event) {
        if (event && event.target) {
            const field = event.target.name;
            const value = event.target.value;

            if (field === 'FirstName') {
                this.FirstName = value;
            } else if (field === 'LastName') {
                this.LastName = value;
            } else if (field === 'Email') {
                this.Email = value;
            } else if (field === 'Phone') {
                this.Phone = value;
            }
        }
    }

    // Handle input for dynamic campaign-specific questions
    handleDynamicInputChange(event) {
        if (event && event.target) {
            const questionId = event.target.dataset.id;
            const answer = event.target.value;

            this.answers = { ...this.answers, [questionId]: answer };
        }
    }

    // Handle form submission
    handleSubmit() {
        if (!this.answers || Object.keys(this.answers).length === 0) {
            this.showToast('Error', 'No answers provided. Please fill out the form.', 'error');
            return;
        }

        const leadDetails = {
            FirstName: this.FirstName,
            LastName: this.LastName,
            Email: this.Email,
            Phone: this.Phone
        };

        saveAnswers({ questionAnswers: this.answers, leadDetails, campaignId: this.recordId })
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
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(toastEvent);
    }

    // Clear the form after submission
    clearForm() {
        if (this.template) {
            this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(input => {
                input.value = ''; // Clear input fields
            });
        }

        this.FirstName = '';
        this.LastName = '';
        this.Email = '';
        this.Phone = '';
        this.answers = {};
    }

    handleBack(event) {
        this.dispatchEvent(new CustomEvent('backbtnclick'));
    }
}