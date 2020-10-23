export function getFormData(form) {
  if (!form || form.nodeName !== 'FORM') {
    return;
  }
  const data: object = {};
  for (let i = form.elements.length - 1; i >= 0; i = i - 1) {
    if (form.elements[i].name === '') {
      continue;
    }
    switch (form.elements[i].nodeName) {
      case 'INPUT':
        switch (form.elements[i].type) {
          case 'text':
          case 'email':
          case 'hidden':
          case 'password':
          case 'button':
          case 'reset':
          case 'submit':
            data[form.elements[i].name] = form.elements[i].value;
            break;
          case 'checkbox':
            if (form.elements[i].checked) {
              const checkValue = data[form.elements[i].name];
              if (checkValue) {
                data[form.elements[i].name] = [
                  form.elements[i].value,
                  ...checkValue,
                ];
              } else {
                data[form.elements[i].name] = [form.elements[i].value];
              }
            }
            break;
          case 'radio':
            if (form.elements[i].checked) {
              data[form.elements[i].name] = form.elements[i].value;
            }
            break;
          case 'file':
            break;
        }
        break;
      case 'TEXTAREA':
        data[form.elements[i].name] = form.elements[i].value;
        break;
      case 'SELECT':
        switch (form.elements[i].type) {
          case 'select-one':
            data[form.elements[i].name] = form.elements[i].value;
            break;
          case 'select-multiple':
            for (
              let j = form.elements[i].options.length - 1;
              j >= 0;
              j = j - 1
            ) {
              if (form.elements[i].options[j].selected) {
                const selectedOption = data[form.elements[i].name];
                if (selectedOption) {
                  data[form.elements[i].name] = [
                    form.elements[i].options[j].value,
                    ...selectedOption,
                  ];
                } else {
                  data[form.elements[i].name] = [
                    form.elements[i].options[j].value,
                  ];
                }
              }
            }
            break;
        }
        break;
    }
  }

  return data;
}
