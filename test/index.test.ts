import { JSDOM } from 'jsdom';
import mock from 'xhr-mock';

import { setUpWebflowForm, handleWebflowFormSubmit } from '../src';

describe('Setup Webflow Form', () => {
  describe('For not existent form', () => {
    beforeAll(() => {
      const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

      global.document = dom.window.document;
      global.window = dom.window as any;
    });

    it('should throws an error', () => {
      expect(() => {
        setUpWebflowForm('test');
      }).toThrowError('Form with id "wf-form-test" not found!');
    });
  });

  describe('For existent form', () => {
    describe('When not found done block', () => {
      beforeAll(() => {
        const dom = new JSDOM(`
          <div class="form-wrapper w-form">
            <form name="contact-form" data-name="Contact-form" action="https://localhost/forms" method="post" id="wf-form-test">
              <input type="text" name="Nome">
              <input type="email" name="Email">
              <textarea name="Message"></textarea>
            </form>
          </div>
        `);

        global.document = dom.window.document;
        global.window = dom.window as any;
      });

      it('should throws an error', () => {
        const form = document.getElementById('wf-form-test') as HTMLFormElement;

        expect(() => {
          handleWebflowFormSubmit(form);
        }).toThrowError('Not found the form done block!');
      });
    });

    describe('When not found fail block', () => {
      beforeAll(() => {
        const dom = new JSDOM(`
          <div class="form-wrapper w-form">
            <form name="contact-form" data-name="Contact-form" action="https://localhost/forms" method="post" id="wf-form-test">
              <input type="text" name="Nome">
              <input type="email" name="Email">
              <textarea name="Message"></textarea>
              <div class="success-message w-form-done">
                <h2 class="thank-you-title">Thanks!</h2>
                <p>We will contact you.</p>
              </div>
            </form>
          </div>
        `);

        global.document = dom.window.document;
        global.window = dom.window as any;
      });

      it('should throws an error', () => {
        const form = document.getElementById('wf-form-test') as HTMLFormElement;

        expect(() => {
          handleWebflowFormSubmit(form);
        }).toThrowError('Not found the form fail block!');
      });
    });

    describe('Form has no action', () => {
      beforeAll(() => {
        const dom = new JSDOM(`
          <div class="form-wrapper w-form">
            <form name="contact-form" data-name="Contact-form" method="post" id="wf-form-test">
              <input type="text" name="Nome">
              <input type="email" name="Email">
              <textarea name="Message"></textarea>
              <div class="success-message w-form-done">
                <h2 class="thank-you-title">Thanks!</h2>
                <p>We will contact you.</p>
              </div>
              <div class="w-form-fail">
              <p>Whoops! Something is wrong. :(</p>
            </div>
            </form>
          </div>
        `);

        global.document = dom.window.document;
        global.window = dom.window as any;
      });

      it('should throws an error', () => {
        const form = document.getElementById('wf-form-test') as HTMLFormElement;

        expect(() => {
          handleWebflowFormSubmit(form);
        }).toThrowError('No one action defined on form!');
      });
    });

    describe('With form validation implemented', () => {
      beforeAll(() => {
        const dom = new JSDOM(`
          <div class="form-wrapper w-form">
            <form name="contact-form" data-name="Contact-form" action="http://localhost/forms" method="post" id="wf-form-test">
              <input type="text" name="Nome">
              <input type="email" name="Email">
              <textarea name="Message"></textarea>
              <div class="success-message w-form-done">
                <h2 class="thank-you-title">Thanks!</h2>
                <p>We will contact you.</p>
              </div>
              <div class="w-form-fail">
                <p>Whoops! Something is wrong. :(</p>
              </div>
            </form>
          </div>
        `);

        global.document = dom.window.document;
        global.window = dom.window as any;
      });

      it('should validate form', () => {
        const form = document.getElementById('wf-form-test') as HTMLFormElement;

        const isValid = jest.fn();

        handleWebflowFormSubmit(form, {
          isValid,
        });
        expect(isValid).toHaveBeenCalledTimes(1);
      });
    });

    describe('With valid form', () => {
      beforeEach(() => mock.setup());

      // put the real XHR object back and clear the mocks after each test
      afterEach(() => mock.teardown());

      describe('With success result', () => {
        const action = 'http://localhost/forms';
        const method = 'post';

        const name = 'Samuel';
        const email = 'sam.martins.dev@gmail.com';
        const message = 'Testing...';

        beforeAll(() => {
          const dom = new JSDOM(`
        <div class="form-wrapper w-form">
          <form name="contact-form" data-name="Contact-form" action="${action}" method="${method}" id="wf-form-test">
            <input type="text" name="Nome" value="${name}">
            <input type="email" name="Email" value="${email}">
            <textarea name="Message">${message}</textarea>
            <div class="success-message w-form-done">
              <h2 class="thank-you-title">Thanks!</h2>
              <p>We will contact you.</p>
            </div>
            <div class="w-form-fail">
              <p>Whoops! Something is wrong. :(</p>
            </div>
          </form>
        </div>
      `);

          global.document = dom.window.document;
          global.window = dom.window as any;
        });
        it('should send request to action with method and form data', () => {
          mock[method](action, (req, res) => {
            expect(req.header('Content-Type')).toEqual('application/json');
            expect(req.body()).toEqual(
              `{"Message":"${message}","Email":"${email}","Nome":"${name}"}`
            );
            return res.status(201).body('{}');
          });

          const form = document.getElementById(
            'wf-form-test'
          ) as HTMLFormElement;

          handleWebflowFormSubmit(form);

          const updatedForm = document.getElementById(
            'wf-form-test'
          ) as HTMLFormElement;
        });
      });

      describe('With success result preparing data', () => {
        const action = 'http://localhost/forms';
        const method = 'post';

        const name = 'Samuel';
        const email = 'sam.martins.dev@gmail.com';
        const message = 'Testing...';

        beforeAll(() => {
          const dom = new JSDOM(`
        <div class="form-wrapper w-form">
          <form name="contact-form" data-name="Contact-form" action="${action}" method="${method}" id="wf-form-test">
            <input type="text" name="Nome" value="${name}">
            <input type="email" name="Email" value="${email}">
            <textarea name="Message">${message}</textarea>
            <div class="success-message w-form-done">
              <h2 class="thank-you-title">Thanks!</h2>
              <p>We will contact you.</p>
            </div>
            <div class="w-form-fail">
              <p>Whoops! Something is wrong. :(</p>
            </div>
          </form>
        </div>
      `);

          global.document = dom.window.document;
          global.window = dom.window as any;
        });
        it('should send request to action with method and form data', () => {
          mock[method](action, (req, res) => {
            expect(req.header('Content-Type')).toEqual('application/json');
            expect(req.body()).toEqual(
              `{"content":{"Message":"${message}","Email":"${email}","Nome":"${name}"}}`
            );
            return res.status(201).body('{}');
          });

          const form = document.getElementById(
            'wf-form-test'
          ) as HTMLFormElement;

          handleWebflowFormSubmit(form, {
            prepareData(data: any) {
              return {
                content: data,
              };
            },
          });

          const updatedForm = document.getElementById(
            'wf-form-test'
          ) as HTMLFormElement;
        });
      });

      describe('Failing request', () => {
        const action = 'http://localhost/forms';
        const method = 'post';

        const name = 'Samuel';
        const email = 'sam.martins.dev@gmail.com';
        const message = 'Testing...';

        beforeAll(() => {
          const dom = new JSDOM(
            `
        <div class="form-wrapper w-form">
          <form name="contact-form" data-name="Contact-form" action="${action}" method="${method}" id="wf-form-test">
            <input type="text" name="Nome" value="${name}">
            <input type="email" name="Email" value="${email}">
            <textarea name="Message">${message}</textarea>
            <div class="success-message w-form-done">
              <h2 class="thank-you-title">Thanks!</h2>
              <p>We will contact you.</p>
            </div>
            <div class="w-form-fail">
              <p>Whoops! Something is wrong. :(</p>
            </div>
          </form>
        </div>
      `,
            { runScripts: 'dangerously' }
          );

          global.document = dom.window.document;
          global.window = dom.window as any;
        });
        it('should send request to action with method and form data', () => {
          mock[method](action, (req, res) => {
            expect(req.header('Content-Type')).toEqual('application/json');
            expect(req.body()).toEqual(
              `{"content":{"Message":"${message}","Email":"${email}","Nome":"${name}"}}`
            );
            return res.status(500).body('{}');
          });

          const form = document.getElementById(
            'wf-form-test'
          ) as HTMLFormElement;

          handleWebflowFormSubmit(form, {
            prepareData(data: any) {
              return {
                content: data,
              };
            },
          });
        });
      });
    });
  });
});
