type Props = { children: React.ReactNode };

export default function ExamLayout({ children }: Props) {
    return (
        <div className="min-h-screen bg-white">
            {children}
        </div>
    );
}