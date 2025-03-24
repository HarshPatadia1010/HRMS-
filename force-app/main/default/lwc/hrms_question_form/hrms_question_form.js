import { LightningElement, api, track } from 'lwc';
import getQuestions from '@salesforce/apex/QuestionController.getQuestions';
import saveAnswers from '@salesforce/apex/QuestionController.saveAnswers';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import FirstName from '@salesforce/schema/Lead.FirstName';
import LastName from '@salesforce/schema/Lead.LastName';
import Email from '@salesforce/schema/Lead.Email';
import Phone from '@salesforce/schema/Lead.Phone';

export default class Hrms_question_form extends LightningElement {
    @api recordId;
    @track questions=[];
    @track answer={};
    // @track personalDetails={ 
    // FirstName:'',
    // LastName:'',
    // Email:'',
    // Phone:''};
    @track FirstName;
    @track LastName;
    @track Email;
    @track Phone;
    connectedCallback() {
        this.loadQuestions();
        console.log("hi this is personal details");
        console.log(this.personalDetails);
};
    renderedCallback() {
        console.log("hi this is personal details");
        console.log(this.personalDetails);
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
    // handlePersonalInputChange(event) {
    //     const field = event.target.name;
    //     const value = event.target.value;
    //     this.personalDetails[field] = value;
    // }
    handlePersonalInputChange(event){
        // Null-check for event.target
        if (event && event.target) {
            const field = event.target.name; // Field name from the input
            const value = event.target.value; // Input value
        //     if (!this.personalDetails) {
        //         this.personalDetails = { FirstName:'', LastName:'',Email:'',Phone:''}; // Initialize if it's undefined
        //     }
        //     this.personalDetails[field] = value; // Store value in personalDetails map
        // } else {
        //     console.error('Event or event.target is null or undefined in handlePersonalInputChange.');
        // }
        if(field=='FirstName'){
            this.FirstName=value;
        }
        else if(field=='LastName'){
            this.LastName=value;
        }
        else if(field=='Email'){
            this.Email=value;   
        }
        else if(field=='Phone'){
            this.Phone=value;
        }
    };

    // Handle input for dynamic campaign-specific questions
    // handleDynamicInputChange(event) {
    //     const questionId = event.target.dataset.id;
    //     const answer = event.target.value;
    //     this.answers[questionId] = answer;
    // };
  
  
    handleDynamicInputChange(event)
    {
        // Null-check for event and event.target
        if (event && event.target) {
            const questionId = event.target.dataset.id; // Question ID from data-id
            const answer = event.target.value; // User's answer from the input
            
            // Null-check for answers map
            if (!this.answers) {
                this.answers = {}; // Initialize if it's undefined
            }

            // Save the answer in the answers map
            this.answers[questionId] = answer;
        } else {
            console.error('Event or event.target is null or undefined in handleDynamicInputChange.');
        }
    }

    // Handle form submission
    handleSubmit()
    {
        // Null-check for answers before proceeding
        if (!this.answers || Object.keys(this.answers).length === 0) {
            this.showToast('Error', 'No answers provided. Please fill out the form.', 'error');
            return;
        }
        const allAnswers = { ...this.answers };


        const leadDetails ={
            FirstName: this.FirstName,
            LastName: this.LastName,
            Email: this.Email,
            Phone: this.Phone
        };

        saveAnswers({ questionAnswers: allAnswers, leadDetails:leadDetails,campaignId:this.recordId })
            
            .then(() => {
                this.showToast('Success', 'Application submitted successfully!', 'success');
                this.clearForm();
            })
            .catch(error => {
                this.showToast('Error', 'Failed to submit the application.', 'error');
                console.error('Error saving answers:', error);
            });
    };

    // Show toast notifications
    showToast(title, message, variant)
    {
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(toastEvent);
    }

    // Clear the form after submission
    clearForm()
    {
       // Safeguard clearing the fields
       if (this.template) {
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(input => {
            input.value = ''; // Clear input fields
        });
    } else {
        console.error('Template is unavailable for clearing the form.');
    }
        this.FirstName='';
        this.LastName='';
        this.Email='';
        this.Phone='';
        this.answers = {};
    }
      handleBack()
      {
          this.dispatchEvent(new CustomEvent('backbtnclick'));
      }
    // handleBack(event){
    //     this.dispatchEvent(new CustomEvent('backbtnclick'));
    // }
}
}