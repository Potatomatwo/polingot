import { SimpleForm, Create, TextInput, required, ReferenceInput, NumberInput } from "react-admin";

export const LessonCreate = () => {
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
        </Create>
    );
};
