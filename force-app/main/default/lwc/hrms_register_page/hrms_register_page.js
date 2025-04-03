import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CHARACTER_IMAGE from '@salesforce/resourceUrl/loginpage_image_1';
import PLANT_IMAGE from '@salesforce/resourceUrl/loginpage_image_2';

export default class HrmsRegisterPage extends NavigationMixin(LightningElement) {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track isLoading = false;

    // Static resource URLs
    characterUrl = CHARACTER_IMAGE;
    plantUrl = PLANT_IMAGE;

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.validateForm();
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.validateForm();
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.validateForm();
    }

    validateForm() {
        this.isFormValid = this.firstName && 
            this.lastName && 
            this.email;
    }

    handleLoginClick(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__hrms_login_page'
            }
        });
    }

    async handleRegister(event) {
        event.preventDefault();
        
        if (!this.isFormValid) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill all required fields',
                    variant: 'error'
                })
            );
            return;
        }

        this.isLoading = true;

        try {
            // Here you would typically make an API call to your backend service
            // For now, we'll just simulate a successful registration
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Registration successful! Please check your email for login credentials.',
                    variant: 'success'
                })
            );
            
            // Navigate to login page after successful registration
            this[NavigationMixin.Navigate]({
                type: 'standard__component',
                attributes: {
                    componentName: 'c__hrms_login_page'
                }
            });
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An error occurred during registration. Please try again.',
                    variant: 'error'
                })
            );
        } finally {
            this.isLoading = false;
        }
    }
}