import { Button } from "@/components/ui/button";

const ButtonsPage = () => {
    return (
        <div className="p-4 space-y-4 flex flex-col max-w-[200px]:" >Buttons page! {/* space refers to the spacing between the buttons, flex flex col changes the width, centers the texts and button */}
            <Button>
                Default
            </Button> {/* Variant can be customized in button.tsx file */}
            <Button variant="primary">
                Primary
            </Button>
            <Button variant="primaryOutline">
                Primary Outline
            </Button>
                <Button variant="secondary">
                Secondary
            </Button>
            <Button variant="secondaryOutline">
                Secondary Outline
            </Button>
            <Button variant="danger">
                Danger
            </Button>
            <Button variant="dangerOutline">
                Danger Outline
            </Button>
            <Button variant="super">
                Super
            </Button>            
            <Button variant="superOutline">
                Super Outline
            </Button> 
            <Button variant="ghost">
                Ghost
            </Button>
            <Button variant="sidebar">
                Sidebar
            </Button>
            <Button variant="sidebarOutline">
                Sidebar Outline
            </Button>  
        </div>
    );
};

export default ButtonsPage;
