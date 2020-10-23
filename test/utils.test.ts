import { JSDOM } from 'jsdom';
import { getFormData } from '../src/utils';
describe('Utils', () => {
  describe('getFormData', () => {
    beforeAll(() => {
      const dom = new JSDOM(
        `
        <form name="contact-form" action="/index.php" method="post" id="form">
            <!-- Ignore methods input without name -->
            <input type="text" value="a">

            <!-- Input type text -->
            <input id="name" type="text" name="text" value="a">

            <!-- Input type email -->
            <input type="email" name="email" value="b">

            <!-- Textarea -->
            <textarea name="textarea">c</textarea>

            <!-- Checkbox with only one checked -->
            <input type="checkbox" name="checkboxOne" value="1" checked>
            <input type="checkbox" name="checkboxOne" value="2">
            <input type="checkbox" name="checkboxOne" value="3">

            <!-- Checkbox with more than one checked -->
            <input type="checkbox" name="checkbox" value="1" checked>
            <input type="checkbox" name="checkbox" value="2" checked>
            <input type="checkbox" name="checkbox" value="3">
            <input type="checkbox" name="checkbox" value="4">
            <input type="checkbox" name="checkbox" value="5" checked>

            <!-- Radio -->
            <input type="radio" name="radio" value="r1">
            <input type="radio" name="radio" value="r2">
            <input type="radio" name="radio" value="r3" checked>

            <!-- Ignore type file -->
            <input type="file" name="file" id="">

            <!-- Select one -->
            <select name="select">
            <option value="1">1</option>
            <option selected value="2">2</option>
            <option value="3">3</option>
            </select>

            <!-- Select multiple -->
            <select name="selectMulti" multiple>
              <option selected value="m1">1</option>
              <option selected value="m2">2</option>
              <option value="m3">3</option>
              <option value="m4" selected>4</option>
            </select>
          </form>
      `,
        { runScripts: 'dangerously' }
      );

      global.document = dom.window.document;
      global.window = dom.window as any;
    });

    describe('For no form element', () => {
      it('should return undefined', () => {
        const input = document.getElementById('name');

        const res = getFormData(input);

        expect(res).toBeUndefined();
      });
    });

    describe('For complex form', () => {
      it('should return form data', () => {
        const form = document.getElementById('form');

        const data = getFormData(form);

        expect(data).toStrictEqual({
          text: 'a',
          email: 'b',
          textarea: 'c',
          checkboxOne: ['1'],
          checkbox: ['1', '2', '5'],
          radio: 'r3',
          select: '2',
          selectMulti: ['m1', 'm2', 'm4'],
        });
      });
    });
  });
});
