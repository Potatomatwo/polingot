export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

export function detectLanguage(text: string): string {
    // Check for Japanese characters (hiragana, katakana, kanji)
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    if (hasJapanese) return "ja-JP";
    
    // Check for Chinese characters (simplified/traditional)
    const hasChinese = /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text);
    if (hasChinese) return "zh-CN";
    
    // Check for Korean
    const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text);
    if (hasKorean) return "ko-KR";
    
    // Default to English
    return "en-US";
}

export function sanitizeJapanese(str: string): string {
    if (!str) return "";

    const katakanaToHiragana = (text: string) =>
        text.replace(/[\u30A1-\u30F6]/g, match =>
            String.fromCharCode(match.charCodeAt(0) - 0x60)
        );

    const kanjiMap: Record<string, string> = {
        // Pronouns
        '私は': 'わたしは', '私が': 'わたしが', '私を': 'わたしを',
        '私に': 'わたしに', '私の': 'わたしの', '私': 'わたし',
        '僕は': 'ぼくは', '僕': 'ぼく', '俺': 'おれ',
        // Food & drink
        '肉を': 'にくを', '肉が': 'にくが', '肉は': 'にくは', '肉': 'にく',
        '魚を': 'さかなを', '魚': 'さかな',
        '野菜': 'やさい', 'ご飯': 'ごはん', '朝ご飯': 'あさごはん',
        '昼ご飯': 'ひるごはん', '夜ご飯': 'よるごはん',
        '水': 'みず', 'お茶': 'おちゃ', '牛乳': 'ぎゅうにゅう',
        // Verbs — negative, masu, ta, te, dictionary forms
        '食べない': 'たべない', '食べます': 'たべます', '食べた': 'たべた',
        '食べて': 'たべて', '食べる': 'たべる', '食べ': 'たべ',
        '飲まない': 'のまない', '飲みます': 'のみます', '飲んだ': 'のんだ',
        '飲んで': 'のんで', '飲む': 'のむ', '飲み': 'のみ',
        '行かない': 'いかない', '行きます': 'いきます', '行った': 'いった',
        '行って': 'いって', '行く': 'いく', '行き': 'いき',
        '来ない': 'こない', '来ます': 'きます', '来た': 'きた',
        '来て': 'きて', '来る': 'くる',
        '帰らない': 'かえらない', '帰ります': 'かえります', '帰る': 'かえる',
        '見ない': 'みない', '見ます': 'みます', '見た': 'みた',
        '見て': 'みて', '見る': 'みる',
        '聞かない': 'きかない', '聞きます': 'ききます', '聞いた': 'きいた',
        '聞いて': 'きいて', '聞く': 'きく',
        '話さない': 'はなさない', '話します': 'はなします', '話した': 'はなした',
        '話して': 'はなして', '話す': 'はなす',
        '書かない': 'かかない', '書きます': 'かきます', '書いた': 'かいた',
        '書いて': 'かいて', '書く': 'かく',
        '読まない': 'よまない', '読みます': 'よみます', '読んだ': 'よんだ',
        '読んで': 'よんで', '読む': 'よむ',
        '分からない': 'わからない', '分かる': 'わかる', '分かった': 'わかった',
        '知らない': 'しらない', '知る': 'しる', '知った': 'しった',
        '思わない': 'おもわない', '思います': 'おもいます', '思う': 'おもう',
        // Adjectives
        '好き': 'すき', '嫌い': 'きらい', '大好き': 'だいすき',
        '大きい': 'おおきい', '小さい': 'ちいさい',
        '高い': 'たかい', '安い': 'やすい',
        '新しい': 'あたらしい', '古い': 'ふるい',
        '良い': 'よい', '悪い': 'わるい',
        '暑い': 'あつい', '寒い': 'さむい',
        '難しい': 'むずかしい', '易しい': 'やさしい',
        '面白い': 'おもしろい', '楽しい': 'たのしい',
        // Common nouns add kanji here that the system can't recognize
        '日本語': 'にほんご', '英語': 'えいご', '中国語': 'ちゅうごくご',
        '今日': 'きょう', '明日': 'あした', '昨日': 'きのう',
        '今': 'いま', '前': 'まえ', '後': 'あと',
        '人': 'ひと', '子供': 'こども', '友達': 'ともだち',
        '先生': 'せんせい', '学生': 'がくせい', '製品': 'せいひん',
        '学校': 'がっこう', '家': 'いえ', '会社': 'かいしゃ',
        '電車': 'でんしゃ', '車': 'くるま', '自転車': 'じてんしゃ',
        // Numbers — compound first, then single
        '十一': 'じゅういち', '十二': 'じゅうに', '十三': 'じゅうさん',
        '十四': 'じゅうし', '十五': 'じゅうご', '十六': 'じゅうろく',
        '十七': 'じゅうしち', '十八': 'じゅうはち', '十九': 'じゅうきゅう',
        '二十': 'にじゅう', '三十': 'さんじゅう', '四十': 'よんじゅう',
        '五十': 'ごじゅう', '六十': 'ろくじゅう', '七十': 'ななじゅう',
        '八十': 'はちじゅう', '九十': 'きゅうじゅう',
        '二百': 'にひゃく', '三百': 'さんびゃく', '四百': 'よんひゃく',
        '五百': 'ごひゃく', '六百': 'ろっぴゃく', '七百': 'ななひゃく',
        '八百': 'はっぴゃく', '九百': 'きゅうひゃく',
        '二千': 'にせん', '三千': 'さんぜん', '四千': 'よんせん',
        '一': 'いち', '二': 'に', '三': 'さん', '四': 'し',
        '五': 'ご', '六': 'ろく', '七': 'しち', '八': 'はち',
        '九': 'きゅう', '十': 'じゅう', '百': 'ひゃく', '千': 'せん',
        '万': 'まん',
    };

    // Sort longest keys first to prevent partial replacements
    let result = str;
    const sortedKeys = Object.keys(kanjiMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        result = result.replace(new RegExp(key, 'g'), kanjiMap[key]);
    }

    // Arabic numbers to readings
    const numMap: Record<string, string> = {
        '10': 'じゅう', '11': 'じゅういち', '12': 'じゅうに',
        '13': 'じゅうさん', '14': 'じゅうし', '15': 'じゅうご',
        '16': 'じゅうろく', '17': 'じゅうしち', '18': 'じゅうはち',
        '19': 'じゅうきゅう', '20': 'にじゅう', '30': 'さんじゅう',
        '0': 'ぜろ', '1': 'いち', '2': 'に', '3': 'さん',
        '4': 'し', '5': 'ご', '6': 'ろく', '7': 'しち',
        '8': 'はち', '9': 'きゅう',
    };
    // Sort longer numbers first
    const sortedNums = Object.keys(numMap).sort((a, b) => b.length - a.length);
    result = result.replace(/\d+/g, match => {
        for (const num of sortedNums) {
            if (match === num) return numMap[num];
        }
        return match;
    });

    // Katakana to hiragana
    result = katakanaToHiragana(result);

    // Normalize small characters
    result = result.replace(/[ぁ-ゖ]/g, match => {
        const smallToFull: Record<string, string> = {
            'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
            'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'っ': 'つ',
        };
        return smallToFull[match] || match;
    });

    result = result
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:'"()\[\]{}<>«»""''/\\|@#$%^&*~`+=_-]/g, '')
        .replace(/[。、！？「」『』【】（）［］｛｝＜＞《》〜～・]/g, '')
        .replace(/[ー]/g, '')
        .replace(/\s+/g, '');

    return result;
}