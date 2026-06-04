import { SimpleForm, Create, TextInput, required, ReferenceInput, NumberInput } from "react-admin";

export const UnitCreate = () => {
    return(
        <Create>
            <SimpleForm>
                {/* No ID field here - it's auto-generated */}
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
        </Create>
    );
};
