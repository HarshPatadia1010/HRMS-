// hrms_login_page.js
import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CHARACTER_IMAGE from '@salesforce/resourceUrl/loginpage_image_1';
import PLANT_IMAGE from '@salesforce/resourceUrl/loginpage_image_2';


export default class HrmsLoginPage extends NavigationMixin(LightningElement) {
    @track email = '';
    @track password = '';
    @track rememberMe = false;
    @track showSpinner = false;

    // Static resource URLs
    characterUrl = CHARACTER_IMAGE;
    plantUrl = PLANT_IMAGE;

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleRememberMe(event) {
        this.rememberMe = event.target.checked;
    }

    handleLogin(event) {
        if (this.validateForm()) {
            this.showSpinner = true;
            
            authenticateUser({
                email: this.email,
                password: this.password
            })
            .then(result => {
                if (result.success) {
                    // Store user info if remember me is checked
                    if (this.rememberMe) {
                        localStorage.setItem('userEmail', this.email);
                    } else {
                        localStorage.removeItem('userEmail');
                    }
                    
                    this.showToast('Success', 'Login successful!', 'success');
                    this.navigateToHome();
                } else {
                    this.showToast('Error', result.message, 'error');
                }
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            })
            .finally(() => {
                this.showSpinner = false;
            });
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (!allValid) {
            this.showToast('Error', 'Please fill in all required fields correctly.', 'error');
            return false;
        }

        return true;
    }

    handleForgotPassword() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Forgot_Password'
            }
        });
    }

    handleRegister() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Register'
            }
        });
    }

    navigateToHome() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
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

    connectedCallback() {
        // Check for remembered email
        const rememberedEmail = localStorage.getItem('userEmail');
        if (rememberedEmail) {
            this.email = rememberedEmail;
            this.rememberMe = true;
        }
    }
    handleRegisterClick(event){
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__hrms_register_page'
                     }
                                     });
    }

    // handleRegisterClick(event) {
    //     event.preventDefault();
    //     this[NavigationMixin.Navigate]({
    //         type: 'standard__component',
    //         attributes: {
    //             componentName: 'c__hrms_register_page'
    //         }
    //     });
    // }
    
}