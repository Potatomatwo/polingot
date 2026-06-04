import { SimpleForm, Edit, TextInput, required, NumberInput } from "react-admin";

export const CourseEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <NumberInput 
                    source="id" 
                    label="ID"
                />
                <TextInput 
                    source="title" 
                    validate={[required()]} 
                    label="Title" 
                    fullWidth
                />
                <TextInput 
                    source="imageSrc" 
                    validate={[required()]} 
                    label="Image URL"
                    fullWidth
                />
            </SimpleForm>
        </Edit>
    );
};
