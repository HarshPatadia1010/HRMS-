import { LightningElement, track } from 'lwc';
import saveCandidate from '@salesforce/apex/OnboardingFormController.saveCandidate';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OnboardingForm extends LightningElement {
    @track currentStep = 1;
    @track formData = {};
    @track currentTechnicalSkill = '';
    @track currentSoftSkill = '';
    @track currentCertification = '';
    @track technicalSkills = [];
    @track softSkills = [];
    @track certifications = [];

    get showStep1() {
        return this.currentStep === 1;
    }

    get showStep2() {
        return this.currentStep === 2;
    }

    get showStep3() {
        return this.currentStep === 3;
    }

    get showStep4() {
        return this.currentStep === 4;
    }

    get isFirstStep() {
        return this.currentStep === 1;
    }

    get isLastStep() {
        return this.currentStep === 4;
    }

    get progressPercentage() {
        return ((this.currentStep - 1) / 3) * 100;
    }

    get progressStepClass1() {
        return `progress-step ${this.currentStep >= 1 ? 'active' : ''}`;
    }

    get progressStepClass2() {
        return `progress-step ${this.currentStep >= 2 ? 'active' : ''}`;
    }

    get progressStepClass3() {
        return `progress-step ${this.currentStep >= 3 ? 'active' : ''}`;
    }

    get progressStepClass4() {
        return `progress-step ${this.currentStep >= 4 ? 'active' : ''}`;
    }

    get nextButtonLabel() {
        return this.isLastStep ? 'Submit' : 'Next';
    }

    connectedCallback() {
        this.updateProgressBar();
    }

    updateProgressBar() {
        const progressFill = this.template.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${this.progressPercentage}%`;
        }
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.formData = {
            ...this.formData,
            [name]: value
        };
    }

    handleSkillChange(event) {
        const { name, value } = event.target;
        if (name === 'technicalSkill') {
            this.currentTechnicalSkill = value;
        } else if (name === 'softSkill') {
            this.currentSoftSkill = value;
        } else if (name === 'certification') {
            this.currentCertification = value;
        }
    }

    addTechnicalSkill() {
        if (this.currentTechnicalSkill && !this.technicalSkills.includes(this.currentTechnicalSkill)) {
            this.technicalSkills = [...this.technicalSkills, this.currentTechnicalSkill];
            this.currentTechnicalSkill = '';
            this.formData.TechnicalSkills__c = this.technicalSkills.join(', ');
        }
    }

    addSoftSkill() {
        if (this.currentSoftSkill && !this.softSkills.includes(this.currentSoftSkill)) {
            this.softSkills = [...this.softSkills, this.currentSoftSkill];
            this.currentSoftSkill = '';
            this.formData.SoftSkills__c = this.softSkills.join(', ');
        }
    }

    addCertification() {
        if (this.currentCertification && !this.certifications.includes(this.currentCertification)) {
            this.certifications = [...this.certifications, this.currentCertification];
            this.currentCertification = '';
            this.formData.Certifications__c = this.certifications.join(', ');
        }
    }

    removeTechnicalSkill(event) {
        const skillToRemove = event.target.dataset.skill;
        this.technicalSkills = this.technicalSkills.filter(skill => skill !== skillToRemove);
        this.formData.TechnicalSkills__c = this.technicalSkills.join(', ');
    }

    removeSoftSkill(event) {
        const skillToRemove = event.target.dataset.skill;
        this.softSkills = this.softSkills.filter(skill => skill !== skillToRemove);
        this.formData.SoftSkills__c = this.softSkills.join(', ');
    }

    removeCertification(event) {
        const certToRemove = event.target.dataset.skill;
        this.certifications = this.certifications.filter(cert => cert !== certToRemove);
        this.formData.Certifications__c = this.certifications.join(', ');
    }

    handleNext() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateProgressBar();
        }
    }

    handlePrevious() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgressBar();
        }
    }

    handleNextClick() {
        if (this.isLastStep) {
            this.saveCandidate();
        } else {
            this.handleNext();
        }
    }

    async saveCandidate() {
        try {
            // Show loading state
            this.template.querySelector('.onboarding-form').classList.add('loading');

            // Call the Apex controller to save the candidate data
            const result = await saveCandidate({ candidateData: this.formData });
            
            // Show success message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Candidate information saved successfully',
                    variant: 'success'
                })
            );

            // Reset form
            this.currentStep = 1;
            this.formData = {};
            this.technicalSkills = [];
            this.softSkills = [];
            this.certifications = [];
            this.currentTechnicalSkill = '';
            this.currentSoftSkill = '';
            this.currentCertification = '';
            this.updateProgressBar();
            
        } catch (error) {
            // Show error message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        } finally {
            // Remove loading state
            this.template.querySelector('.onboarding-form').classList.remove('loading');
        }
    }
}