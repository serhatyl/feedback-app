import {html, fixture, expect} from '@open-wc/testing';
import '../../src/components/feedback-widget';
import {FeedbackWidget} from '../../src/components/feedback-widget';

describe('FeedbackWidget', () => {
  it('renders a button to open the modal', async () => {
    const el: FeedbackWidget = await fixture(
      html`<feedback-widget></feedback-widget>`
    );
    const button = el.shadowRoot?.querySelector('.feedback-button');
    expect(button).to.exist;
  });

  it('should display the modal when the feedback button is clicked', async () => {
    const el: FeedbackWidget = await fixture(
      html` <feedback-widget></feedback-widget> `
    );
    (
      el.shadowRoot!.querySelector('.feedback-button')! as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const modal = el.shadowRoot?.querySelector('.modal');
    expect(modal).to.not.have.class('hidden');
  });

  it('should submit form data and display success message, then close modal', async () => {
    const el: FeedbackWidget = await fixture(
      html`<feedback-widget></feedback-widget>`
    );
    const button = el.shadowRoot?.querySelector(
      '.feedback-button'
    ) as HTMLButtonElement;
    button.click();
    await el.updateComplete;

    const form = el.shadowRoot?.querySelector('form') as HTMLFormElement;
    const nameInput = form.querySelector(
      'input[name="customerFullName"]'
    ) as HTMLInputElement;
    const feedbackInput = form.querySelector(
      'textarea[name="feedbackMessage"]'
    ) as HTMLTextAreaElement;
    const submitButton = form.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    nameInput.value = 'Lorem Ipsum';
    feedbackInput.value = 'This is a feedback test message';
    submitButton.click();

    el.formSubmitted = true;
    await el.updateComplete;

    const successWrapper = el.shadowRoot?.querySelector('.success-wrapper');
    expect(successWrapper).to.exist;

    const successMessage = (
      el.shadowRoot?.querySelector('.success-message') as HTMLDivElement
    ).innerText;
    expect(successMessage).to.equal(el.submitSuccessText);

    const closeButton = el.shadowRoot?.querySelector(
      '.close-button'
    ) as HTMLButtonElement;
    closeButton.click();
    await el.updateComplete;
    const modal = el.shadowRoot?.querySelector('.modal');
    expect(modal).to.have.class('hidden');
  });
});
