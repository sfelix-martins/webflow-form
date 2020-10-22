import { getFormData } from './utils';

interface WebflowFormOptions {
  /**
   * The name of the attribute from form's submit button that contains the value
   * that will be shown on button text during request.
   */
  waitTextAttributeName?: string;

  /**
   * The selector of the element that contains the block to show on success.
   */
  doneBlockSelector?: string;

  /**
   * The selector of the element that contains the block to show on fail.
   */
  failBlockSelector?: string;

  /**
   * A function that receives the form data and must return the data that will
   * be sent on request.
   *
   * @param data - The form data extracted before prepare data
   */
  prepareData?(data: object): object;

  /**
   * Check if the form is valid before submit it.
   *
   * @param data - The form data extracted before prepare data
   */
  isValid?(data: object): boolean;
}

function handleWebflowFormSubmit(
  form: HTMLFormElement,
  {
    waitTextAttributeName = 'data-wait',
    doneBlockSelector = '.w-form-done',
    failBlockSelector = '.w-form-fail',
    prepareData = (data) => data,
    isValid = (_) => true,
  }: WebflowFormOptions = {}
) {
  const inputSubmit: HTMLInputElement = document.activeElement as HTMLInputElement;
  const waitingText =
    inputSubmit.getAttribute(waitTextAttributeName) ?? 'Submitting...';
  const defaultText = inputSubmit.getAttribute('value') ?? 'Submit';
  const container = form.parentNode;
  const doneBlock: HTMLDivElement = container.querySelector(doneBlockSelector);
  if (!doneBlock) {
    throw new Error('Not found the form done block!');
  }
  const failBlock: HTMLDivElement = container.querySelector(failBlockSelector);
  if (!failBlock) {
    throw new Error('Not found the form fail block!');
  }

  const action = form.getAttribute('action');
  if (!action) {
    throw new Error('No one action defined on form!');
  }

  const method = form.getAttribute('method');

  const formData = getFormData(form);

  if (!isValid(formData)) {
    return;
  }

  const body = JSON.stringify(prepareData(formData));

  inputSubmit.value = waitingText;

  var httpRequest = new XMLHttpRequest();
  httpRequest.onload = function () {
    if (this.status.toString().match(/^20/)) {
      form.style.display = 'none';
      doneBlock.style.display = 'block';
      failBlock.style.display = 'none';
    } else {
      form.style.display = 'block';
      doneBlock.style.display = 'hidden';
      failBlock.style.display = 'block';
    }

    inputSubmit.value = defaultText;
  };

  httpRequest.open(method, action);
  httpRequest.setRequestHeader('Content-Type', 'application/json');
  httpRequest.send(body);
}

/**
 * Register an webflow form to send request to some backend!
 *
 * @param {string} name - The name of the form defined on form block settings
 */
function setUpWebflowForm(name: string, options: WebflowFormOptions = {}) {
  const id = `wf-form-${name}`;

  const form: HTMLFormElement = document.getElementById(id) as HTMLFormElement;
  if (!form) {
    throw new Error(`Form with id "${id}" not found!`);
  }

  form.onsubmit = function (e) {
    e.preventDefault();

    handleWebflowFormSubmit(form, options);
  };
}

export { setUpWebflowForm, handleWebflowFormSubmit };
