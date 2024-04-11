import {unref} from 'vue';
import DataType from "elevuetor/data-types/data-type";
import Model from 'elevuetor/data-types/model';

//Validate a property with its value
const _validate = (record, prop, config) => {
    
    const property = record._properties[prop]; 

    if (["id", "created", "updated"].indexOf(prop) !== -1
        || property.type.prototype instanceof Model //TODO maybe deep validate related models?
    ){
        return;
    }

    delete record._errors[prop]; 

    let errors = [];

    //special types handle their own validation
    if (property.type.baseType === DataType){
        errors = record._values[prop]._validate();
        if (errors.length){
            record._errors[prop] = errors;    
        }
    }

    //Check required fields
    let val = unref(record._values[prop]);

    if(
        (
            //config not set and property not nullable 
            (!config.hasOwnProperty("required") 
                || property.config.nullable === false)
            
            //or config requires it
            || config.required === true
        )
        && (
            val === null 
            || val === undefined
            || property.type === String && val.trim() === ""
        )
    ){
        record._addError(
            prop,
            'required',
            '{fieldName} is required.'
        );  
    }
}

//Take the model instance, loop over all the properties
const Validate = (record, prop = null) => {
    const properties = record.constructor.properties;

    //overload for validating just one prop
    if (prop !== null){
        _validate(record, prop, properties[prop]);
        return;
    }

    //go through every property, checking each
    for (let name in properties){
        _validate(record, name, properties[name]);
    }
}

export default Validate;