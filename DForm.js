
// Create Forms
function dForm_Create(form_schema, modalId, values) {
    const modalContainer = document.querySelector(modalId);

    //Empty All Child
    let child = Array.from(modalContainer.querySelector('form').childNodes).slice(0, -2).filter((con) => con.tagName === 'DIV');
    child.forEach((con) => {
        con.innerHTML = ''
        count = 0
    })

    // Iterate through the form schema to create rows or accordions
    Object.keys(form_schema).forEach((con_key) => {
        let { e_type, row_Schema, e_name, group_con } = form_schema[con_key];

        const groupContainer = modalContainer.querySelector(`.${group_con}`)

        dRow_ContainerCreate(groupContainer, con_key, form_schema[con_key]);
        const parentCon = document.querySelector(`#${con_key}`);

        if (e_type === "dynamicAccordion"){
           let accVal = values?.[group_con] ? values[group_con] : null;
           accordionCreate(groupContainer, parentCon, accVal, row_Schema, {e_name, e_type})
        }
        else if(e_type === "staticAccordion"){
            let accVal = values?.[group_con] ? values[group_con] : null;
            accordionCreate(groupContainer, parentCon, accVal, row_Schema, {e_name, e_type})
        }
        else {
            handleDynamicRows(parentCon, form_schema, con_key, values);
        }
    });
}

//Create Accordion
function accordionCreate(groupContainer, parentCon, accordion_values, row_Schema, eleObj){

    if(eleObj.e_type === "dynamicAccordion"){

        if(accordion_values){
           //Create Multiple Accordion
           groupContainer.innerHTML = ''
           accordion_values.forEach((obj, index)=>{   //Create Accordion On Basis Of this Loop

                count++
                let buttonConfig = {
                    buttonText: index+1 == 1 ? '+' : '-' ,
                    buttonFun: index+1 == 1 ? '_addAccordion(event)'  : '_deleteAccordion(event)'
                }

                let conId = index+1 == 1 ? parentCon.id : `${parentCon.id}_${count}`
                let shallowCopy = parentCon.cloneNode(true)
                shallowCopy.id = conId

                groupContainer.appendChild(shallowCopy)
                let accordionBody = createAccordion(shallowCopy, `${parentCon.id}-${count}`,`${eleObj.e_name}-${count}`, buttonConfig);

                Object.keys(row_Schema).forEach((key) => {
                    dRow_ContainerCreate(accordionBody, key, row_Schema[key]);
                    const acParentCon = accordionBody.querySelector(`#${key}`);

                    handleDynamicRows(acParentCon, row_Schema, key, accordion_values[index]);
                });
           })
        }
        else{
            count++
            let buttonConfig = { buttonText: '+', buttonFun: '_addAccordion(event)' }
            let accordionBody = createAccordion(parentCon, `${parentCon.id}-${count}`,`${eleObj.e_name}` , buttonConfig);
            Object.keys(row_Schema).forEach((key) => {
                dRow_ContainerCreate(accordionBody, key, row_Schema[key]);
                const acParentCon = accordionBody.querySelector(`#${key}`);
                handleDynamicRows(acParentCon, row_Schema, key, null);
            });
        }
    }
    else{
        //For Static Accordion Code
        let accordionBody = createAccordion(parentCon, `${parentCon.id}-${count}`,`${eleObj.e_name}` , null);
        Object.keys(row_Schema).forEach((key) => {
            dRow_ContainerCreate(accordionBody, key, row_Schema[key]);
            const acParentCon = accordionBody.querySelector(`#${key}`);
            handleDynamicRows(acParentCon, row_Schema, key, accordion_values? accordion_values : null);
        });
    }

}

// Handle Dynamic and Static Rows
function handleDynamicRows(parentRowContainer, formSchema, key, rowVal){
    if (formSchema[key]['e_type'] === "dynamicRow") {
        if (rowVal) {
            let value = rowVal[formSchema[key]['e_name']]

            value.forEach((obj, index) => {

                const buttonConfig = {
                    buttonText: index+1 == '1' ? '+' : '-',
                    buttonFun: index+1 == '1' ? '_addRow(event)' : '_deleteRow(event)',
                };
                dRow_Create(parentRowContainer, formSchema[key]['row_Schema'], buttonConfig);
            });
            dFormSelectedValue(parentRowContainer, value)

        }
        else {
            dRow_Create(parentRowContainer, formSchema[key]['row_Schema'], { buttonText: '+', buttonFun: '_addRow(event)'});
        }
    } else {
        dRow_Create(parentRowContainer, formSchema[key]['row_Schema'], null);
        if (rowVal){
            let staticObj = {};
            formSchema[key]['row_Schema'].forEach((rowObj)=>{
                staticObj[rowObj['f_name']] = rowVal[rowObj['f_name']]
            })
            dFormSelectedValue(parentRowContainer, [staticObj])
        }
    }
}


//Add values Trigger Event
function dFormSelectedValue(parentRowCon, rowValues){

    let rows = parentRowCon.querySelectorAll('.row');

    rows.forEach((row, index) => {

       let value = rowValues[index]

       row.childNodes.forEach((con)=>{

          let field = con.querySelector('input, select')
          if(field){

             if(Array.isArray(value[field.name])){
                field.value = JSON.stringify(value[field.name])
                let rowConList = con.querySelector('div')
                let click = new Event('click')
                rowConList.dispatchEvent(click)
             }
             else{
                if(value[field.name]){

                    if(field.hasAttribute('onclick')){
                        let click = new Event('click')
                        field.value = value[field.name]
                        field.dispatchEvent(click)
                    }
                    else{
                      field.value = value[field.name]
                      let change = new Event('change')
                      field.dispatchEvent(change)
                    }
                }
             }
          }
       })
    });
}



//Group Static Data
function dFormGroupStaticData(schema, values){
    let schemaKeys = Object.keys(schema)
    let groupValue = {}

    schemaKeys.forEach((key)=>{
      let rowType = schema[key]['rowType']

      if(rowType === 'Static'){
         let schemaObj = schema[key]['row_Schema']
         let groupVal = {}

         schemaObj.forEach((obj)=> groupVal[obj.f_name] = values[obj.f_name])
         groupValue[key] = groupVal
      }
    })

    return groupValue
}


//Create Form Json
function createFormJson(schema, jsonObj, fromCon, jsonField){

   checkConType(schema, jsonObj)
   Object.keys(schema).forEach((key)=>{

       let {group_con, e_type, e_name} = schema[key]

       if(e_type === 'staticAccordion'){

         let accordionParent = fromCon.querySelector(`.${group_con}`)
         jsonObj[group_con] = {}

         let rowCon = Array.from(accordionParent.childNodes)[0]
         let accordionBody = rowCon.childNodes[0].querySelector('.accordion-body')

         checkConType(schema[key]['row_Schema'], jsonObj[group_con], accordionBody)
       }

       if(e_type === 'dynamicAccordion'){

          let accordionParent = fromCon.querySelector(`.${group_con}`)
          let accordionChild = Array.from(accordionParent.childNodes)

          jsonObj[group_con] = []

          accordionChild.forEach((con)=>{
              let rowCon = con.querySelector('.row')

              let accRowObj = {}
              jsonObj[group_con].push(accRowObj)

              let accordionBody = rowCon.childNodes[0].querySelector('.accordion-body')
              checkConType(schema[key]['row_Schema'], accRowObj, accordionBody)
          })
       }
   })
   console.log(JSON.stringify(jsonObj))
   jsonField.value = JSON.stringify(jsonObj)
}