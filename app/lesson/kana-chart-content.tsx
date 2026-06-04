export const KanaChartContent = () => {
    const hiragana = [
        // Vowels
        { char: "あ", romaji: "a" },
        { char: "い", romaji: "i" },
        { char: "う", romaji: "u" },
        { char: "え", romaji: "e" },
        { char: "お", romaji: "o" },
        // K-row
        { char: "か", romaji: "ka" },
        { char: "き", romaji: "ki" },
        { char: "く", romaji: "ku" },
        { char: "け", romaji: "ke" },
        { char: "こ", romaji: "ko" },
        // S-row
        { char: "さ", romaji: "sa" },
        { char: "し", romaji: "shi" },
        { char: "す", romaji: "su" },
        { char: "せ", romaji: "se" },
        { char: "そ", romaji: "so" },
        // T-row
        { char: "た", romaji: "ta" },
        { char: "ち", romaji: "chi" },
        { char: "つ", romaji: "tsu" },
        { char: "て", romaji: "te" },
        { char: "と", romaji: "to" },
        // N-row
        { char: "な", romaji: "na" },
        { char: "に", romaji: "ni" },
        { char: "ぬ", romaji: "nu" },
        { char: "ね", romaji: "ne" },
        { char: "の", romaji: "no" },
        // H-row
        { char: "は", romaji: "ha" },
        { char: "ひ", romaji: "hi" },
        { char: "ふ", romaji: "fu" },
        { char: "へ", romaji: "he" },
        { char: "ほ", romaji: "ho" },
        // M-row
        { char: "ま", romaji: "ma" },
        { char: "み", romaji: "mi" },
        { char: "む", romaji: "mu" },
        { char: "め", romaji: "me" },
        { char: "も", romaji: "mo" },
        // Y-row
        { char: "や", romaji: "ya" },
        { char: "ゆ", romaji: "yu" },
        { char: "よ", romaji: "yo" },
        // R-row
        { char: "ら", romaji: "ra" },
        { char: "り", romaji: "ri" },
        { char: "る", romaji: "ru" },
        { char: "れ", romaji: "re" },
        { char: "ろ", romaji: "ro" },
        // W-row
        { char: "わ", romaji: "wa" },
        { char: "を", romaji: "wo" },
        { char: "ん", romaji: "n" },
    ];

    const katakana = [
        // Vowels
        { char: "ア", romaji: "a" },
        { char: "イ", romaji: "i" },
        { char: "ウ", romaji: "u" },
        { char: "エ", romaji: "e" },
        { char: "オ", romaji: "o" },
        // K-row
        { char: "カ", romaji: "ka" },
        { char: "キ", romaji: "ki" },
        { char: "ク", romaji: "ku" },
        { char: "ケ", romaji: "ke" },
        { char: "コ", romaji: "ko" },
        // S-row
        { char: "サ", romaji: "sa" },
        { char: "シ", romaji: "shi" },
        { char: "ス", romaji: "su" },
        { char: "セ", romaji: "se" },
        { char: "ソ", romaji: "so" },
        // T-row
        { char: "タ", romaji: "ta" },
        { char: "チ", romaji: "chi" },
        { char: "ツ", romaji: "tsu" },
        { char: "テ", romaji: "te" },
        { char: "ト", romaji: "to" },
        // N-row
        { char: "ナ", romaji: "na" },
        { char: "ニ", romaji: "ni" },
        { char: "ヌ", romaji: "nu" },
        { char: "ネ", romaji: "ne" },
        { char: "ノ", romaji: "no" },
        // H-row
        { char: "ハ", romaji: "ha" },
        { char: "ヒ", romaji: "hi" },
        { char: "フ", romaji: "fu" },
        { char: "ヘ", romaji: "he" },
        { char: "ホ", romaji: "ho" },
        // M-row
        { char: "マ", romaji: "ma" },
        { char: "ミ", romaji: "mi" },
        { char: "ム", romaji: "mu" },
        { char: "メ", romaji: "me" },
        { char: "モ", romaji: "mo" },
        // Y-row
        { char: "ヤ", romaji: "ya" },
        { char: "ユ", romaji: "yu" },
        { char: "ヨ", romaji: "yo" },
        // R-row
        { char: "ラ", romaji: "ra" },
        { char: "リ", romaji: "ri" },
        { char: "ル", romaji: "ru" },
        { char: "レ", romaji: "re" },
        { char: "ロ", romaji: "ro" },
        // W-row
        { char: "ワ", romaji: "wa" },
        { char: "ヲ", romaji: "wo" },
        { char: "ン", romaji: "n" },
    ];

    const palatalized = [
        // Hiragana
        { char: "きゃ", romaji: "kya" },
        { char: "きゅ", romaji: "kyu" },
        { char: "きょ", romaji: "kyo" },
        { char: "しゃ", romaji: "sha" },
        { char: "しゅ", romaji: "shu" },
        { char: "しょ", romaji: "sho" },
        { char: "ちゃ", romaji: "cha" },
        { char: "ちゅ", romaji: "chu" },
        { char: "ちょ", romaji: "cho" },
        { char: "にゃ", romaji: "nya" },
        { char: "にゅ", romaji: "nyu" },
        { char: "にょ", romaji: "nyo" },
        { char: "ひゃ", romaji: "hya" },
        { char: "ひゅ", romaji: "hyu" },
        { char: "ひょ", romaji: "hyo" },
        { char: "みゃ", romaji: "mya" },
        { char: "みゅ", romaji: "myu" },
        { char: "みょ", romaji: "myo" },
        { char: "りゃ", romaji: "rya" },
        { char: "りゅ", romaji: "ryu" },
        { char: "りょ", romaji: "ryo" },
        { char: "ぎゃ", romaji: "gya" },
        { char: "ぎゅ", romaji: "gyu" },
        { char: "ぎょ", romaji: "gyo" },
        { char: "じゃ", romaji: "ja" },
        { char: "じゅ", romaji: "ju" },
        { char: "じょ", romaji: "jo" },
        { char: "びゃ", romaji: "bya" },
        { char: "びゅ", romaji: "byu" },
        { char: "びょ", romaji: "byo" },
        { char: "ぴゃ", romaji: "pya" },
        { char: "ぴゅ", romaji: "pyu" },
        { char: "ぴょ", romaji: "pyo" },
    ];

    const katakanaPlural = [
        // Katakana
        { char: "キャ", romaji: "kya" },
        { char: "キュ", romaji: "kyu" },
        { char: "キョ", romaji: "kyo" },
        { char: "シャ", romaji: "sha" },
        { char: "シュ", romaji: "shu" },
        { char: "ショ", romaji: "sho" },
        { char: "チャ", romaji: "cha" },
        { char: "チュ", romaji: "chu" },
        { char: "チョ", romaji: "cho" },
        { char: "ニャ", romaji: "nya" },
        { char: "ニュ", romaji: "nyu" },
        { char: "ニョ", romaji: "nyo" },
        { char: "ヒャ", romaji: "hya" },
        { char: "ヒュ", romaji: "hyu" },
        { char: "ヒョ", romaji: "hyo" },
        { char: "ミャ", romaji: "mya" },
        { char: "ミュ", romaji: "myu" },
        { char: "ミョ", romaji: "myo" },
        { char: "リャ", romaji: "rya" },
        { char: "リュ", romaji: "ryu" },
        { char: "リョ", romaji: "ryo" },
        { char: "ギャ", romaji: "gya" },
        { char: "ギュ", romaji: "gyu" },
        { char: "ギョ", romaji: "gyo" },
        { char: "ジャ", romaji: "ja" },
        { char: "ジュ", romaji: "ju" },
        { char: "ジョ", romaji: "jo" },
        { char: "ビャ", romaji: "bya" },
        { char: "ビュ", romaji: "byu" },
        { char: "ビョ", romaji: "byo" },
        { char: "ピャ", romaji: "pya" },
        { char: "ピュ", romaji: "pyu" },
        { char: "ピョ", romaji: "pyo" },
    ];

    const ChartGrid = ({ data }: { data: { char: string; romaji: string }[] }) => (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {data.map((item) => (
                <div
                    key={item.char}
                    className="border border-gray-300 rounded-lg p-3 text-center hover:bg-sky-50 transition cursor-pointer"
                >
                    <p className="text-xl font-bold">{item.char}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.romaji}</p>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Hiragana */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-blue-600">Hiragana (ひらがな)</h3>
                <ChartGrid data={hiragana} />
            </div>

            {/* Katakana */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-red-600">Katakana (カタカナ)</h3>
                <ChartGrid data={katakana} />
            </div>

            {/* Palatalized Hiragana */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-blue-600">Palatalized Combinations (拗音)</h3>
                <ChartGrid data={palatalized} />
            </div>

            {/* Palatalized Katakana */}
            <div>
                <h3 className="font-bold text-lg mb-4 text-red-600">Palatalized Katakana</h3>
                <ChartGrid data={katakanaPlural} />
            </div>
        </div>
    );
};