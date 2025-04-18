// Create Multi Select DropDown
function dCreateMultiSelect(obj,row_container){
   let container = document.createElement('div')
   if(!obj["f_display"]) container.classList.add('d-none')

   let hidden_input = document.createElement('input')
   hidden_input.classList.add('d-none')
   hidden_input.name = obj.f_name
   hidden_input.value = JSON.stringify([]);

   container.classList.add(obj.f_display_name, `col-lg-${obj.f_width}`)

   let label = document.createElement('label')
   label.classList.add('form-label',  'fw-bold')
   label.textContent = obj.f_display_name

   let optionList = document.createElement('div')
   optionList.classList.add('list', 'form-select', 'ik-txt3')
   optionList.style.cssText = 'position: relative; height: 28px; padding: 0px'
   optionList.setAttribute('onclick', obj.a_onChange);

   let para = document.createElement('p')
   para.classList.add('ml-2', 'mt-1')
   para.textContent = '-------'

   let optionItems =  document.createElement('div')
   optionItems.classList.add('d-none', 'items')
   optionItems.style.cssText = "position: absolute; top: -25px; height: 18vh; overflow: scroll; background-color: white; box-shadow : 0px 4px 12px rgba(0, 0, 0, 0.2); border : 1px solid rgba(0, 0, 0, 0.3); width:18vw;";
   optionList.appendChild(para)
   optionList.appendChild(hidden_input)
   optionList.appendChild(optionItems)

   container.appendChild(label)
   container.appendChild(optionList)

   row_container.appendChild(container)
   if(obj.v_options.length != 0){
      dCreateMultiSelectOption(optionItems, obj.v_options)
   }
}


// Create MultiSelect Options
function dCreateMultiSelectOption(container, list){
    container.innerHTML = ''
    let fragment = document.createDocumentFragment()

    let buttonDiv = document.createElement('div')
    buttonDiv.classList.add('d-flex', 'justify-between')
    buttonDiv.style.cssText = "border-bottom : 1px solid rgba(0, 0, 0, 0.3);"
    fragment.appendChild(buttonDiv)

    let selectAllButton = document.createElement('button')
    selectAllButton.type = 'button'
    selectAllButton.classList.add('btn')
    selectAllButton.style.cssText = "padding: 2px; width: 126px; font-weight: bold;"
    selectAllButton.setAttribute('onclick', 'selectAllOptions(event)')
    selectAllButton.textContent = `SelectAll`

    let clearAllButton = document.createElement('button')
    clearAllButton.type = 'button'
    clearAllButton.classList.add('btn')
    clearAllButton.style.cssText = "padding: 2px; width: 126px; font-weight: bold;"
    clearAllButton.setAttribute('onclick', 'clearAllOptions(event)')
    clearAllButton.textContent = `ClearAll`

    let closeAllButton = document.createElement('button')
    closeAllButton.type = 'button'
    closeAllButton.classList.add('btn')
    closeAllButton.style.cssText = "padding: 2px; width: 126px; font-weight: bold;"
    closeAllButton.setAttribute('onclick', 'closeDropDown(event)')
    closeAllButton.textContent = `Close`

    buttonDiv.appendChild(selectAllButton)
    buttonDiv.appendChild(clearAllButton)
    buttonDiv.appendChild(closeAllButton)

    list.forEach((val)=>{
        let button = document.createElement('button')
        button.classList.add("selectable", 'col-md-12', 'btn', 'text-dark',  'text-start','py-0')
        button.value = `${val}`
        button.type = 'button'
        button.setAttribute('onclick', 'selectMultipleOption(this)')

        let span = document.createElement('span')
        span.innerText = `${val}`

        let i = document.createElement('i')
        i.classList.add('text-dark')

        span.appendChild(i)
        button.appendChild(span)
        fragment.appendChild(button)
    })
    container.appendChild(fragment)
}


// Toggle Multiple Option
function dToggleMultiOption(button, optionContainer){
    button.classList.toggle('selected');

    const buttonText = button.querySelector('span');
    const i = button.querySelector('span i');

    i.classList.toggle('bi-check');
    i.classList.toggle('text-dark');

    if (button.classList.contains('selected')) {
        button.style.backgroundColor = '#e8e8e8';
        dAddMultiSelectOption(button.value, optionContainer);
    }
    else {
        button.style.backgroundColor = '';
        dRemoveMultiSelectOption(button.value, optionContainer);
    }
}


// Add MultiSelect Option
function dAddMultiSelectOption(value, optionContainer) {

    let para = optionContainer.querySelector('p');
    let input = optionContainer.querySelector('input');

    let jsonInput = JSON.parse(input.value || "[]")

    if(!jsonInput.includes(value)){
        jsonInput.push(value)
    }

    const newValue = JSON.stringify(jsonInput);
    input.value = newValue;
    input.setAttribute('value', newValue);
    para.textContent = jsonInput.length <= 2 ? jsonInput.join(", ") : `${jsonInput.length} Selected`;
}


// Remove MultiSelect Option
function dRemoveMultiSelectOption(value, optionContainer){
    let para = optionContainer.querySelector('p')

    let input = optionContainer.querySelector('input');
    let jsonInput = JSON.parse(input.value)

    let index = jsonInput.indexOf(value)
    jsonInput.splice(index, 1)

    const newValue = JSON.stringify(jsonInput);
    input.value = newValue;
    input.setAttribute('value', newValue);

    para.textContent = jsonInput.length <= 2 ? jsonInput.join(", ") : `${jsonInput.length} Selected`;
    if(jsonInput.length <= 0) para.textContent = '--------'
}


// Add All Select Options
function dAddMultipleOptions(optionContainer, list){

    let buttonContainer = optionContainer.querySelector('div')
    const buttons = buttonContainer.querySelectorAll('button');

    buttons.forEach(btn => {
        const spanI = btn.querySelector('span i');
        if (list.includes(btn.value)){
            spanI.classList.add('bi-check');
            spanI.classList.add('text-dark');
            btn.classList.add('selected');
            btn.style.backgroundColor = '#e8e8e8';

            //Add Value
            dAddMultiSelectOption(btn.value, optionContainer);
        }
    });

}


//Clear All
function dClearAll(optionList, optionContainer){
    let buttonContainer = optionContainer.querySelector('div')
    let click = new Event('click')

    optionList.forEach(op => dRemoveMultiSelectOption(op, optionContainer))
    const buttons = buttonContainer.querySelectorAll('button');

    buttons.forEach((button)=>{
        if(button.classList.contains('selected')){
             button.classList.remove('selected')
             button.style.backgroundColor = ''
             const buttonText = button.querySelector('span');
             const i = button.querySelector('span i');
             i.classList.toggle('bi-check');
             i.classList.toggle('text-dark');
        }
    })
}


//Create And Set Dynamic Options
function createDynamicOptions(event, optionList){
    let container = event.currentTarget.querySelector('div');
    let list = container.parentNode.querySelector('input')
    container.classList.toggle('d-none');

    dCreateMultiSelectOption(container, optionList)
    let inputVal = container.parentNode.querySelector('input').value

    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
        const spanI = btn.querySelector('span i');
        if (JSON.parse(inputVal).includes(btn.value)){
            spanI.classList.add('bi-check');
            spanI.classList.add('text-dark');
            btn.classList.add('selected');
            btn.style.backgroundColor = '#e8e8e8';
        }
    });
}


window.dCreateMultiSelect = dCreateMultiSelect;
window.dCreateMultiSelectOption = dCreateMultiSelectOption;
window.dToggleMultiOption = dToggleMultiOption;
window.dAddMultiSelectOption = dAddMultiSelectOption;
window.dRemoveMultiSelectOption = dRemoveMultiSelectOption;
window.dAddMultipleOptions = dAddMultipleOptions;
window.dClearAll = dClearAll;
window.createDynamicOptions = createDynamicOptions;