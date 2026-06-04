import { Header } from "./header";
import { Footer } from "./footer";

    type Props = {
        children: React.ReactNode;
    };
    
    const MarketingLayout = ({ children }:Props) => {
    return (
        <div className="min-h-screen flex flex-col">          
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center"> {/* every page created in the "marketing" folder will have the same layout, meaning all pages created here will have the header and footer*/}
              {children} 
            </main>
            <Footer />
        </div>
    );
}

    export default MarketingLayout;
