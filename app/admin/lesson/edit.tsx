import { SimpleForm, Edit, TextInput, required, ReferenceInput, NumberInput } from "react-admin";

export const LessonEdit = () => {
    return(
        <Edit>
            <SimpleForm>
                {/* No ID field here - it's auto-generated */}
                <TextInput 
                    source="title" 
                    validate={[required()]} 
                    label="Title" 
                    fullWidth
                />
                <ReferenceInput
                source="unitId"
                reference="units"
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
