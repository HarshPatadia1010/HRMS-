import { LightningElement, api, track } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionController.getQuestions';
import saveAnswers from '@salesforce/apex/QuestionController.saveAnswers';
import saveFile from '@salesforce/apex/QuestionController.saveFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Hrms_question_form extends LightningElement {
    @api recordId;
    @track questions = [];
    @track answers = {};
    @track FirstName = '';
    @track LastName = '';
    @track Email = '';
    @track Phone = '';
    fileData;

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
    }

    // Handle dynamic question responses
    handleDynamicInputChange(event) {
        this.answers = { ...this.answers, [event.target.dataset.id]: event.target.value };
    }

    // Handle file selection and convert to Base64
    handleFileChange(event) {
        if (event.target.files.length > 0) {
            let file = event.target.files[0];
            let reader = new FileReader();
            reader.onload = () => {
                let base64 = reader.result.split(',')[1]; // Extract Base64
                this.fileData = {
                    filename: file.name,
                    base64: base64
                };
            };
            reader.readAsDataURL(file);
        }
    }

    // Handle form submission
    handleSubmit() {
        if (!this.FirstName || !this.LastName || !this.Email || !this.Phone) {
            this.showToast('Error', 'Please fill in all personal details.', 'error');
            return;
        }

        if (!this.answers || Object.keys(this.answers).length === 0) {
            this.showToast('Error', 'No answers provided. Please fill out the form.', 'error');
            return;
        }

        saveAnswers({ questionAnswers: this.answers, firstName: this.FirstName, lastName: this.LastName, email: this.Email, phone: this.Phone, campaignId: this.recordId })
            .then((leadId) => {
                this.showToast('Success', 'Application submitted successfully!', 'success');
                
                // If file exists, upload it
                if (this.fileData) {
                    saveFile({ fileName: this.fileData.filename, base64Data: this.fileData.base64, recordId: leadId })
                        .then(() => {
                            this.showToast('Success', 'File uploaded successfully!', 'success');
                        })
                        .catch(error => {
                            this.showToast('Error', 'File upload failed.', 'error');
                            console.error('Error uploading file:', error);
                        });
                }
                
                this.clearForm();
            })
            .catch(error => {
                this.showToast('Error', 'Failed to submit the application.', 'error');
                console.error('Error saving answers:', error);
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    clearForm() {
        this.FirstName = '';
        this.LastName = '';
        this.Email = '';
        this.Phone = '';
        this.answers = {};
        this.fileData = null;
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('backbtnclick'));
    }
}