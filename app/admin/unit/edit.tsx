import { SimpleForm, Edit, TextInput, required, ReferenceInput, NumberInput } from "react-admin";

export const UnitEdit = () => {
    return(
        <Edit>
            <SimpleForm>
                <NumberInput 
                    source="id" 
                    validate={[required()]} 
                    label="Id" 
                />
                <TextInput 
                    source="title" 
                    validate={[required()]} 
                    label="Title" 
                    fullWidth
                />
                <TextInput 
                    source="description" 
                    validate={[required()]} 
                    label="Description"
                    fullWidth
                    helperText="Enter image path like: /images/JP.svg"
                />
                <ReferenceInput
                source="courseId"
                reference="courses"
                />
                <NumberInput 
                source="order"
                validate={[required()]}
                label="Order"
                />
            </SimpleForm>
        </Edit>
    );
};
