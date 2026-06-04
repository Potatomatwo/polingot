import { SimpleForm, Edit, TextInput, NumberInput, SelectInput, ReferenceInput, AutocompleteInput, required } from "react-admin";

const challengeTypes = [
    { id: 'SELECT', name: 'Select (Multiple Choice)' },
    { id: 'ASSIST', name: 'Assist (Fill in blank)' },
    { id: 'TYPING', name: 'Typing (Text Input)' },
    { id: 'SPEAKING', name: 'Speaking (Voice Recognition)' },
    { id: 'LISTENING', name: 'Listening (Audio Comprehension)' },
];

export const ChallengeEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <NumberInput source="id" disabled label="ID" />
                <TextInput source="question" validate={[required()]} label="Question" fullWidth />
                <SelectInput 
                    source="type" 
                    choices={challengeTypes} 
                    validate={[required()]} 
                    label="Challenge Type"
                />
                <ReferenceInput 
                    source="lessonId" 
                    reference="lessons" 
                    label="Lesson"
                >
                    <AutocompleteInput 
                        optionText="title" 
                        optionValue="id"
                        fullWidth
                    />
                </ReferenceInput>
                <NumberInput source="order" label="Order" />
            </SimpleForm>
        </Edit>
    );
};