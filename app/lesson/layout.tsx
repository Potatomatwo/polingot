import { KanaChartModal } from "@/app/lesson/kana-chart-modal";

type Props = {
    children: React.ReactNode;
};


const LessonLayout = ({ children }: Props) => {
    return ( 
        <div className="flex flex-col h-full">
            <div className="flex flex-col h-full w-full">
                {children}
            </div>
            <KanaChartModal />
        </div>
    );
};

export default LessonLayout;
