
//create Parent Row Container
function dRow_ContainerCreate(parentContainer , con_id, schema){

    let div = document.createElement('div')
    div.id = con_id
    div.classList.add('mt-2', schema['e_name'])

    if (schema['e_display']) {
       div.style.display = 'block';
    } else {
        div.style.display = 'none';
    }
    parentContainer.appendChild(div)
    return div
}

// Create Row
function dRow_Create(parentContainer, row_schema, buttonObj){
    let f_row_container =  document.createElement('div')
    f_row_container.classList.add('row', 'mt-2')

    parentContainer.appendChild(f_row_container)
    let inputListType = ["text", "email", "number", "password", "date", "time", "date_range", "phone"]

    row_schema.forEach((field_schema)=>{

        if(inputListType.includes(field_schema.f_type)){
           createInputFields(field_schema, f_row_container)
        }
        else if(field_schema.f_type === "single_select"){
            createSingleSelectFields(field_schema, f_row_container)
        }
        else if(field_schema.f_type === "data_list"){
            createDataList(field_schema, f_row_container)
        }
        else if(field_schema.f_type === "multi_select"){
            dCreateMultiSelect(field_schema, f_row_container)
        }
    })

    if(buttonObj){
        parentContainer.style.border = "0.5px dotted black";
        parentContainer.style.padding = "10px";
        parentContainer.style.borderRadius = "5px";

        let buttonCon =  document.createElement('div')
        buttonCon.textContent = buttonObj['buttonText']
        buttonCon.classList.add('addButton', 'col-lg-2', 'mt-4')
        buttonCon.style.cssText = 'cursor : pointer'
        buttonCon.setAttribute('onclick', buttonObj['buttonFun'])

        buttonCon.style.setProperty('display', 'block', 'important');
        // Append Delete Button
        f_row_container.appendChild(buttonCon)
    }
}


//Add Row
function dRowAdd(event, schema){

    let parentContainer = event.target.parentNode.parentNode;
    let rowSchema, buttonCon

    if (parentContainer.parentNode.classList[0] === "accordion-body") {
        let topAccordianConId = event.target.parentNode.closest('.accordion').parentNode.parentNode.id;
        let accId = topAccordianConId.includes('_') ? topAccordianConId.split('_')[0] : topAccordianConId

        rowSchema = schema[accId]['row_Schema'][parentContainer.id]['row_Schema'];

        buttonCon = {
            buttonText: '-',
            buttonFun: '_deleteRow(event)'
        };
    } else {
        rowSchema = schema[parentContainer.id]['row_Schema'];
        buttonCon = {
            buttonText: '-',
            buttonFun: '_deleteRow(event)'
        };
    }

    let parentConId = parentContainer.id;
    let status = dRow_ValidateSchema(rowSchema);
    dRow_Create(parentContainer, rowSchema, buttonCon);
}


// Delete
function dRow_Delete_Accordion(rowContainer){
    let parentContainer = rowContainer.parentNode
    parentContainer.removeChild(rowContainer)
}


// Set Options
function dRow_SetValues(field, valueList){
   field.innerHTML = ''
   let optional = document.createElement('option')
   let fragment = document.createDocumentFragment()

   optional.textContent = '-------'
   optional.value = ''
   optional.selected = true
   optional.disabled = true
   fragment.appendChild(optional)

   if(valueList && valueList.length !=0){
      valueList.forEach((val)=>{
          let option = document.createElement('option')
          option.textContent = val
          option.value = val
          fragment.appendChild(option)
      })
      field.appendChild(fragment)
   }
}


// Validate JSON Schema
function dRow_ValidateSchema(row_schema){
    let fieldTypeList = ["text", "email", "number", "password", "date", "time", "date_range", "phone", "multi_select", "single_select"]

    // Validate Name
    let field_list = new Set()
    let validate = true

    row_schema.forEach((field_schema)=>{

        if(field_list.has(field_schema.f_display_name)){
           console.error("Display Name Should be Unique")
           validate =  false
        }
        else {
            field_list.add(field_schema.f_display_name);
        }

        if (!fieldTypeList.includes(field_schema.f_type)) {
            console.error("Type field Invalid ! ");
            validate = false;
        }

        if (!field_schema.f_display_name || !field_schema.f_type || !field_schema.f_name) {
            console.error(`Missing required property in field: ${JSON.stringify(field_schema)}`);
            validate = false;
        }

        if (typeof field_schema.f_required !== "boolean") {
            console.error(`Invalid value for 'f_required'. It should be a boolean: ${field_schema.f_display_name}`);
            validate = false;
        }

        if ((field_schema.f_type === "multi_select" || field_schema.f_type === "single_select")
                && (!Array.isArray(field_schema.v_options))) {
            console.error(`Options are missing or invalid for field: ${field_schema.f_display_name}`);
            validate = false;
        }

    })
    return validate
}

// Create Input Field
function createInputFields(field_schema, row_container){
    let container = document.createElement('div')
    container.classList.add(field_schema.f_display_name, `col-lg-${field_schema.f_width}`)

    if(!field_schema.f_display)container.classList.add('d-none')
    if(field_schema.f_display === "always") container.style.setProperty('display', 'block', 'important');

    let label = document.createElement('label')
    label.classList.add('form-label', 'fw-bold')
    label.textContent = field_schema.f_display_name

    let inputTag = document.createElement('input')
    inputTag.classList.add('form-control', 'ik-txt3', 'py-1')
    inputTag.name = field_schema.f_name
    inputTag.type = field_schema.f_type
    inputTag.value = field_schema.v_default
    inputTag.setAttribute('onclick', field_schema.a_onChange)

    container.appendChild(label)
    container.appendChild(inputTag)

     // Apply attributes
    if (field_schema.f_placeholder) inputTag.placeholder = field_schema.f_placeholder;
    if (field_schema.v_min !== undefined) inputTag.min = field_schema.v_min;
    if (field_schema.v_max !== undefined) inputTag.max = field_schema.v_max;
    if (field_schema.v_min_len !== undefined && inputTag.type !== 'number') inputTag.minLength = field_schema.v_min_len;
    if (field_schema.v_max_len !== undefined && inputTag.type !== 'number') inputTag.maxLength = field_schema.v_max_len;
    if (field_schema.f_required) inputTag.required = true;

    row_container.appendChild(container)

}

// Create Single Select DropDown
function createSingleSelectFields(field_schema, row_container){

    let container = document.createElement('div')
    if(!field_schema.f_display)container.classList.add('d-none')
    if(field_schema.f_display === "always") container.style.setProperty('display', 'block', 'important');

    let label = document.createElement('label')
    label.classList.add('form-label', 'fw-bold')
    label.textContent = field_schema.f_display_name

    let selectTag = document.createElement('select')
    selectTag.name = field_schema.f_name
    selectTag.classList.add('form-select', 'ik-txt3', 'py-1')

    if (field_schema.a_onChange) selectTag.setAttribute('onchange', field_schema.a_onChange);
    selectTag.required = field_schema.f_required

    container.classList.add(field_schema.f_display_name, `col-lg-${field_schema.f_width}`)
    container.appendChild(label)
    container.appendChild(selectTag)

    row_container.appendChild(container)

    //Set Options
    dRow_SetValues(selectTag, field_schema.v_options)
    selectTag.value = field_schema.v_default

}

//Create DataList
function createDataList(field_schema, row_container){
    let container = document.createElement('div')
    container.classList.add(field_schema.f_display_name, `col-lg-${field_schema.f_width}`)

    if(!field_schema.f_display)container.classList.add('d-none')
    if(field_schema.f_display === "always") container.style.setProperty('display', 'block', 'important');
    row_container.appendChild(container)

    //Create Lable
    let label = document.createElement('label')
    label.classList.add('form-label', 'fw-bold')
    label.textContent = field_schema.f_display_name
    container.appendChild(label)

    // Create an input element
    const input = document.createElement("input");
    input.setAttribute("list", "items");
    input.setAttribute("id", "myInput");
    input.setAttribute('name', field_schema.f_name)
    input.classList.add('form-select', 'ik-txt3', 'py-1')
    container.appendChild(input);

    // Create a DataList element
    const dataList = document.createElement("datalist");
    dataList.setAttribute("id", "items");
    container.appendChild(dataList);

    // Add options dynamically
    dRow_SetValues(dataList, field_schema.v_options)
}


// Create Accordion
function createAccordion(parentContainer, targetConId, displayName, buttonObj) {
    let topParentContainer = document.createElement('div');
    topParentContainer.classList.add('row')
    parentContainer.appendChild(topParentContainer);

   // Accordion Container
   let accordionCon = document.createElement('div');
   accordionCon.classList.add('accordion', 'col-lg-12');
   topParentContainer.appendChild(accordionCon);


   // Accordion Item Container
   let accordionItemCon = document.createElement('div');
   accordionItemCon.classList.add('accordion-item', 'w-100');
   accordionCon.appendChild(accordionItemCon);

   // Create Accordion Button
   let accordionButton = document.createElement('button');
   accordionButton.classList.add(
      'accordion-button',
      'collapsed',
      'ik-h2',
      'py-1',
      'shadow-none',
      'text-dark',
      'fw-bold'
   );
   accordionButton.type = 'button';
   accordionButton.id = `${targetConId}-header`;
   accordionButton.setAttribute('data-bs-toggle', 'collapse');
   accordionButton.setAttribute('data-bs-target', `#${targetConId}`);
   accordionButton.setAttribute('aria-expanded', 'false');
   accordionButton.setAttribute('aria-controls', targetConId);
   accordionButton.innerHTML = `${displayName}`;
   accordionItemCon.appendChild(accordionButton);

   // Create Target Element Container
   let targetCon = document.createElement('div');
   targetCon.id = targetConId;
   targetCon.classList.add('accordion-collapse', 'collapse', 'mt-3');
   targetCon.setAttribute('aria-labelledby', accordionButton.id);
   targetCon.setAttribute('data-bs-parent', `#${parentContainer.id}`);
   accordionItemCon.appendChild(targetCon);

   // Create Accordion Body
   let accordionBody = document.createElement('div');
   accordionBody.classList.add('accordion-body', 'pt-0');
   targetCon.appendChild(accordionBody);

    // Create Button
    if(buttonObj){
        accordionCon.classList.remove('col-lg-12')
        accordionCon.classList.add('col-lg-11')

        let buttonCon =  document.createElement('div')
        buttonCon.textContent = buttonObj['buttonText']
        buttonCon.classList.add('addButton', 'col-lg-1')
        buttonCon.style.cssText = 'cursor : pointer'
        buttonCon.setAttribute('onclick', buttonObj['buttonFun'])

        topParentContainer.appendChild(buttonCon);
    }
   return accordionBody;
}


//Add Accordion
function _accordionAdd(event, schema, count){
    //Get Form Container
    let accordionParentId = event.target.parentNode.parentNode.id

    let {e_type, e_display, e_name, row_Schema, group_con} = schema[accordionParentId]

    const groupContainer = event.target.parentNode.parentNode.parentNode

    // Create Dynamic Id
    let dynamicId = `${accordionParentId.split('_')[0]}_${count}`

    //Create Accordion Parent Container
    let getCon = dRow_ContainerCreate(groupContainer, dynamicId, schema[accordionParentId])

    //Create Accordion
    let buttonObj = { buttonText: '-', buttonFun: '_deleteAccordion(event)' }
    let accordionBody = createAccordion(getCon, `ac-${count}`, `${e_name}-${count}`, buttonObj)

    //Create Accordion Rows
    Object.keys(row_Schema).forEach((key)=>{
       let rowParent = dRow_ContainerCreate(accordionBody, key, row_Schema[key])
       handleDynamicRows(rowParent, row_Schema, key, null)
    })
}


//Mapping Function
function mappRows(event){
    let dependencyRowCon, rowChild;

    let targetTopParent = event.target.parentNode.parentNode.parentNode
    let topParent = targetTopParent.closest('.row').parentNode

    let labelText = event.target.parentNode.querySelector('label').textContent

    let targetRowSchema  = schema[topParent.id]['row_Schema'][targetTopParent.id]['row_Schema']

    let filterObj = targetRowSchema.find(obj => obj.f_display_name === labelText)

    filterObj['b_rows'].forEach((key)=>{
        let dependencyRowSchema = schema[topParent.id]['row_Schema'][key]['row_Schema']
        if(targetTopParent.id === key){
            dependencyRowCon = targetTopParent
            rowChild = event.target.parentNode.parentNode.childNodes
        }
        else{
            dependencyRowCon = document.querySelector(`#${key}`)
            rowChild = dependencyRowCon.querySelector('.row').childNodes
        }

        dependencyRowCon.style.display = 'block'
        let keyList = dependencyRowSchema.filter(obj => obj.b_name.includes(event.target.value))
        .map(obj => obj.f_display_name);

        // Loop through each child node in rowChild
        Array.from(rowChild).forEach((child) => {
          const hasMatchingClass = keyList.some((className) => child.classList.contains(className));

          if (hasMatchingClass) child.classList.remove('d-none');
          else child.classList.add('d-none');
        });
    })

}


//Get Response
async function getResponse(method, url, resObj, obj = null, csrfToken = null){

    let formData = new FormData()

    if(obj){
        for(let key in obj){
            if(obj.hasOwnProperty(key)){
                formData.append(key, obj[key])
            }
        }
    }
    const dataObject = {
        method,
        ...(method !== 'GET' && {
            headers: {
                ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            },
            ...(obj && { body: formData }),
        }),
    };
    try {
        const res = await fetch(url, dataObject);

        if (!res.ok) {
            console.error("Invalid response:", res.status, res.statusText);
            return null;
        }
        let response =  await res.json();
        resObj['response'] = response
    }
    catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

//-------------------------------------------JSON Function--------------------------------------------------------------

//Check Row Type
function checkConType(schema, parentObject, accordionBody = null){

    Object.keys(schema).forEach((key)=>{

       let {e_type, e_name} = schema[key]

       if(e_type === "dynamicRow"){
          let parentRowCon = accordionBody ? accordionBody.querySelector(`#${key}`) : document.querySelector(`#${key}`)
          createDynamicRowJson(parentObject, parentRowCon, e_name)
       }

       if(e_type === "staticRow"){
          let parentRowCon = accordionBody ? accordionBody.querySelector(`#${key}`) : document.querySelector(`#${key}`)
          createStaticValueObj(parentRowCon, parentObject)
       }
    })

}


// Add Static Value
function createStaticValueObj(parentRowCon, parentObj){
    let rowCon = parentRowCon.querySelector('.row')
    let allFieldCon = rowCon.querySelectorAll('div')

    allFieldCon.forEach((con) => {
      let check = con.classList.contains('d-none');
      if (!check) {
        let field = con.querySelector('input, select');
        if (field) {
          parentObj[field.name] = field.value;
        }
      }
    });


}

// Add Dynamic Value
function createDynamicRowJson(parentObject, parentRowCon, keyName){
    let rowCons = parentRowCon.querySelectorAll('.row')
    let valArray = []

    rowCons.forEach((rowCon, index)=>{
        let rowVal = {}
        let allFieldCon = rowCon.querySelectorAll('div')
        allFieldCon.forEach((con)=>{
            let check = con.classList.contains('d-none');
            if (!check) {
              let field = con.querySelector('input, select')
              if(field){
                rowVal[field.name] = field.value
              }
            }
        })
        valArray.push(rowVal)
    })
    parentObject[keyName] = valArray
}


// Function Export For Both
(function (global, factory) {
    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = factory();
    } else {
        global.MyLibrary = factory();
    }
})(typeof window !== "undefined" ? window : global, function () {
    return {
        dRow_ValidateSchema,
        dRow_ContainerCreate,
        createInputFields,
        createSingleSelectFields,
        dRow_SetValues,
        createAccordion,
        dRow_Create
    };
});
