import Image from "next/image";
import { Button } from "@/components/ui/button";
export const Footer = () => {
    return (
        <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 px-2">
            <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
                <Button size="lg" variant="ghost" className="w-full">
                    <Image 
                    src="/images/JP.svg"
                     alt="Japanese" 
                     height={32} 
                     width={40} 
                     className="mr-4 rounded-md"
                     />
                    Japanese
                </Button>
                <Button size="lg" variant="ghost" className="w-full">
                    <Image 
                    src="/images/DE.svg"
                     alt="German" 
                     height={32} 
                     width={40} 
                     className="mr-4 rounded-md"
                     />
                    German
                </Button>
                <Button size="lg" variant="ghost" className="w-full">
                    <Image 
                    src="/images/CN.svg"
                     alt="Chinese" 
                     height={32} 
                     width={40} 
                     className="mr-4 rounded-md"
                     />
                    Chinese
                </Button>
            </div>
        </footer>
    );
}
