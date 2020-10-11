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
   *
   * A function that receives the form data and must return the data that will
   * be sent on request.
   */
  prepareData?(data: object): object;
}

/**
 * Register an webflow form to send request to some backend!
 *
 * @param {string} name - The name of the form defined on form block settings
 */
function setUpWebflowForm(
  name: string,
  {
    waitTextAttributeName = 'data-wait',
    doneBlockSelector = '.w-form-done',
    failBlockSelector = '.w-form-fail',
    prepareData = (data) => data,
  }: WebflowFormOptions
) {
  const id = `wf-form-${name}`;

  const form: HTMLFormElement = document.getElementById(id) as HTMLFormElement;
  if (!form) {
    console.error(`Form with id "${id}" not found!`);
    return;
  }

  form.onsubmit = function (e) {
    e.preventDefault();

    const inputSubmit: HTMLInputElement = document.activeElement as HTMLInputElement;
    if (!inputSubmit) {
      console.error('Cannot get the submit input');
      return;
    }

    const waitingText = inputSubmit.getAttribute(waitTextAttributeName) ?? 'Submitting...';
    const defaultText = inputSubmit.getAttribute('value') ?? 'Submit';
    const container = form.parentNode;
    if (!container) {
      console.error('Failed getting parent node of the form with done and fail blocks!');
      return;
    }
    const doneBlock: HTMLDivElement = container.querySelector(doneBlockSelector) as HTMLDivElement;
    const failBlock: HTMLDivElement = container.querySelector(failBlockSelector) as HTMLDivElement;
    const action = form.getAttribute('action');
    if (!action) {
      throw new Error('No one action defined on form');
    }
    const method = form.getAttribute('method') ?? 'POST';
    const body = JSON.stringify(prepareData(Object.fromEntries(new FormData(form))));

    inputSubmit.value = waitingText;

    var httpRequest = new XMLHttpRequest();
    httpRequest.onload = function () {
      if (this.status === 201) {
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
  };
}
