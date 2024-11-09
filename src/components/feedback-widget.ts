import {LitElement, html, css} from 'lit-element';
import {property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {when} from 'lit/directives/when.js';

export class FeedbackWidget extends LitElement {
  // State: Modal visibility
  @property({type: Boolean}) modalOpened = false;

  // State: Form submit status
  @property({type: Boolean}) formSubmitted = false;

  // State: Loading state of the http request
  @property({type: Boolean}) loading = false;

  // State: Form input
  @property({type: String}) customerFullName = '';

  // State: Form input
  @property({type: String}) feedbackMessage = '';

  // State: Error message to manage validations & exceptions
  @property({type: String}) errorMessage = '';

  // Widget parameter: Unique key of the customer
  @property({type: String}) apiKey = '';

  // Widget parameter:Google SpreadSheet Id (You can reach in docs url)
  @property({type: String}) spreadSheetId = '';

  // Widget parameter:Google SpreadSheet Name
  @property({type: String}) sheetName = '';

  // Widget parameter: Modal Title
  @property({type: String}) modalTitle = 'Send Your Feedback';

  // Widget parameter: Form submit button text
  @property({type: String}) submitButtonText = 'Submit';

  // Widget parameter: Form submit button loading text
  @property({type: String}) loadingText = 'Loading...';

  // Widget parameter: Submit success text
  @property({type: String}) submitSuccessText = 'We Have Got Your Feedback';

  static override styles = css`
    :host {
      display: block;
      font-family: 'Source Sans 3', sans-serif;
      font-size: 13px;
    }

    .feedback-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: transparent;
      color: #fff;
      border: none;
      border-radius: 50%;
      padding: 0;
      cursor: pointer;

      img {
        width: 50px;
        height: 50px;
      }
    }

    .modal {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgb(0 0 0 / 50%);

      &.hidden {
        display: none;
      }

      .modal-content {
        position: relative;
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
        width: 30vw;

        h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          text-align: center;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          cursor: pointer;
          img {
            height: 18px;
            width: 18px;
          }
        }

        .form-group {
          margin: 8px 0;
          font-size: 12px;

          label {
            font-size: 14px;
            color: #333333;
            font-weight: bold;
          }

          input,
          textarea {
            color: #666666;
            width: 100%;
            max-width: -webkit-fill-available;
            border: solid 1px #e5e5e5;
            border-radius: 3px;
            margin: 3px 0 0 0;
            padding: 6px;
            font-family: 'Source Sans 3', sans-serif;
            &::placeholder {
              font-size: 13px;
            }
          }

          input {
            height: 38px;
          }

          textarea {
            width: 100%;
            height: 100px;
          }
        }

        button {
          cursor: pointer;
          width: 100%;
          padding: 9px 12px;
          background: #f27a1a;
          color: #fff;
          border: solid 1px #e6e6e6;
          font-size: 14px;
          line-height: 18px;
          border-radius: 3px;

          &.disabled {
            cursor: not-allowed;
            background-color: #666666;
          }
        }

        .success-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 12px;
          min-height: 200px;
        }
      }
    }

    @media (max-width: 600px) {
      .modal {
        .modal-content {
          width: 80vw;
        }
      }
    }

    @media only screen and (min-width: 600px) {
      .modal {
        .modal-content {
          width: 60vw;
        }
      }
    }

    @media only screen and (min-width: 992px) {
      .modal {
        .modal-content {
          width: 30vw;
        }
      }
    }
  `;

  override render() {
    const modalClasses = {hidden: !this.modalOpened};
    const submitButtonClasses = {disabled: this.loading};

    return html`
      <button class="feedback-button" @click="${this._toggleModal}">
        <img src="../../assets/feedback.svg" />
      </button>

      <div class="modal ${classMap(modalClasses)}">
        <div class="modal-content">
          ${when(
            !this.formSubmitted,
            () => html`
              <h2>${this.modalTitle}</h2>
              <form @submit="${this._handleSubmit}">
                <div class="form-group">
                  <label>Name</label>
                  <input
                    .value="${this.customerFullName}"
                    name="customerFullName"
                    placeholder="Name & Surname"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Feedback</label>
                  <textarea
                    .value="${this.feedbackMessage}"
                    name="feedbackMessage"
                    placeholder="Share your comments..."
                    maxlength="2000"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  class="${classMap(submitButtonClasses)}"
                  ?disabled=${this.loading}
                >
                  ${this.loading ? this.loadingText : this.submitButtonText}
                </button>
              </form>

              ${when(
                this.errorMessage,
                () => html` <div class="error">${this.errorMessage}</div> `
              )}
            `
          )}
          ${when(
            this.formSubmitted && !this.errorMessage,
            () => html`
              <div class="success-wrapper">
                <img src="../../assets/greenTick.svg" />
                <div class="success-message">${this.submitSuccessText}</div>
              </div>
            `
          )}
          <div class="close-button" @click="${this._toggleModal}">
            <img src="../../assets/close.svg" />
          </div>
        </div>
      </div>
    `;
  }

  private _toggleModal() {
    this.modalOpened = !this.modalOpened;
    document.body.style.overflow = this.modalOpened ? 'hidden' : '';
    this.formSubmitted = false;
  }

  private async _handleSubmit(event: {
    preventDefault: () => void;
    target: HTMLFormElement;
  }) {
    event.preventDefault();
    this.loading = true;
    const data = new FormData(event.target);


    // NOTE spreadSheetId, sheetName using to define current SpreadSheet
    data.append('spreadSheetId', this.spreadSheetId);
    data.append('sheetName', this.sheetName);

    //NOTE I've used google app script to save data to spreadsheet you can check the code
    //**** from ./googleappscript.md
    fetch(
      'https://script.google.com/macros/s/AKfycbzPM_pOyCCDM4TikxGiEwKj9TvfuvN9_1-rLK3KDXtbbphCaQ-uMDx--2LiPLt_nvcZLQ/exec',
      {
        redirect: 'follow',
        method: 'POST',
        body: data,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.result === true) {
          this.formSubmitted = true;
        }
      })
      .catch(() => {
        this.errorMessage = 'Your feedback could not be sent due to an error';
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

customElements.define('feedback-widget', FeedbackWidget);
