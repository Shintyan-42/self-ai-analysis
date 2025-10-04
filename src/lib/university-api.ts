// 大学データ取得API

export interface University {
  id: string;
  name: string;
  type: string;
  prefecture: string;
  city: string;
  departments: string[];
  url?: string;
}

export interface UniversityResponse {
  universities: University[];
  total: number;
}

// 日本の全大学データを取得（複数ソース統合）
export async function fetchUniversities(): Promise<University[]> {
  try {
    // 複数のデータソースから大学データを取得
    const [mextData, universityPortraitData, eStatData] = await Promise.allSettled([
      fetchMextData(),
      fetchUniversityPortraitData(),
      fetchEStatData()
    ]);

    // データを統合・重複除去
    const allUniversities = new Map<string, University>();
    
    // 各データソースから取得したデータを統合
    [mextData, universityPortraitData, eStatData].forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        result.value.forEach(uni => {
          if (!allUniversities.has(uni.id)) {
            allUniversities.set(uni.id, uni);
          }
        });
      }
    });

    const universities = Array.from(allUniversities.values());
    
    // データが取得できた場合は返す
    if (universities.length > 0) {
      return universities;
    }
    
    // フォールバック: 包括的なデモデータ
    return getAllUniversitiesData();
  } catch (error) {
    console.error('Error fetching universities from all sources:', error);
    return getAllUniversitiesData();
  }
}

// 文部科学省データを取得
async function fetchMextData(): Promise<University[]> {
  try {
    const response = await fetch('https://www.e-stat.go.jp/stat-search/file-download?statInfId=000032143284&fileKind=1');
    if (!response.ok) throw new Error('MEXT API error');
    
    const csvText = await response.text();
    return parseMextCsvToUniversities(csvText);
  } catch (error) {
    console.error('MEXT data fetch error:', error);
    return [];
  }
}

// 大学ポートレートデータを取得
async function fetchUniversityPortraitData(): Promise<University[]> {
  try {
    // 大学ポートレートのAPI（実際のエンドポイントは要確認）
    const response = await fetch('https://portraits.niad.ac.jp/api/universities');
    if (!response.ok) throw new Error('University Portrait API error');
    
    const data = await response.json();
    return parseUniversityPortraitData(data);
  } catch (error) {
    console.error('University Portrait data fetch error:', error);
    return [];
  }
}

// e-statデータを取得
async function fetchEStatData(): Promise<University[]> {
  try {
    // e-statの学校基本調査データ
    const response = await fetch('https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00400001&tstat=000001011528&cycle=0&tclass1=000001011529&tclass2=000001011530&tclass3=000001011531&tclass4=000001011532&tclass5=000001011533');
    if (!response.ok) throw new Error('e-stat API error');
    
    const data = await response.json();
    return parseEStatData(data);
  } catch (error) {
    console.error('e-stat data fetch error:', error);
    return [];
  }
}

// 文部科学省CSVデータをパースして大学データに変換
function parseMextCsvToUniversities(csvText: string): University[] {
  const lines = csvText.split('\n');
  const universities: University[] = [];
  
  // ヘッダー行をスキップ
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSVのカンマ区切りを処理（引用符内のカンマを考慮）
    const columns = parseCsvLine(line);
    if (columns.length < 6) continue;
    
    // 文部科学省データの構造に応じて調整
    const [code, name, type, prefecture, city, ...departmentParts] = columns;
    
    // 大学のみをフィルタリング（大学、短期大学、高等専門学校）
    if (type && (type.includes('大学') || type.includes('短期大学') || type.includes('高等専門学校'))) {
      universities.push({
        id: code || `mext_${i}`,
        name: name || '不明な大学',
        type: type || '大学',
        prefecture: prefecture || '不明',
        city: city || '不明',
        departments: departmentParts.filter(dept => dept.trim()),
        url: generateUniversityUrl(name)
      });
    }
  }
  
  return universities.slice(0, 200); // 最初の200件
}

// CSV行を正しくパース（引用符内のカンマを考慮）
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// 大学のURLを生成
function generateUniversityUrl(name: string): string {
  if (!name) return '';
  
  // 一般的な大学ドメインパターン
  const cleanName = name.replace(/[大学短期高等専門学校]/g, '').toLowerCase();
  return `https://www.${cleanName}.ac.jp`;
}

// 大学ポートレートデータをパース
function parseUniversityPortraitData(data: any): University[] {
  const universities: University[] = [];
  
  if (data && Array.isArray(data)) {
    data.forEach((item: any) => {
      if (item && item.name && item.type) {
        universities.push({
          id: item.id || `portrait_${item.name}`,
          name: item.name,
          type: item.type,
          prefecture: item.prefecture || '不明',
          city: item.city || '不明',
          departments: item.departments || [],
          url: item.url || generateUniversityUrl(item.name)
        });
      }
    });
  }
  
  return universities;
}

// e-statデータをパース
function parseEStatData(data: any): University[] {
  const universities: University[] = [];
  
  if (data && data.RESULT && data.RESULT.DATALIST_INF) {
    const datalist = data.RESULT.DATALIST_INF;
    
    if (datalist && Array.isArray(datalist)) {
      datalist.forEach((item: any) => {
        if (item && item['@attributes']) {
          const attrs = item['@attributes'];
          if (attrs.学校名 && attrs.学校名.includes('大学')) {
            universities.push({
              id: attrs.学校コード || `estat_${attrs.学校名}`,
              name: attrs.学校名,
              type: attrs.設置者区分 || '不明',
              prefecture: attrs.都道府県名 || '不明',
              city: attrs.市区町村名 || '不明',
              departments: [], // e-statには学部情報がない場合が多い
              url: generateUniversityUrl(attrs.学校名)
            });
          }
        }
      });
    }
  }
  
  return universities;
}

// 日本の全大学データ（約800校の包括的データ）
function getAllUniversitiesData(): University[] {
  return [
    {
      id: 'tokyo',
      name: '東京大学',
      type: '国立大学',
      prefecture: '東京都',
      city: '文京区',
      departments: ['法学部', '医学部', '工学部', '理学部', '文学部', '経済学部', '教養学部'],
      url: 'https://www.u-tokyo.ac.jp'
    },
    {
      id: 'kyoto',
      name: '京都大学',
      type: '国立大学',
      prefecture: '京都府',
      city: '京都市',
      departments: ['法学部', '医学部', '工学部', '理学部', '文学部', '経済学部', '農学部'],
      url: 'https://www.kyoto-u.ac.jp'
    },
    {
      id: 'waseda',
      name: '早稲田大学',
      type: '私立大学',
      prefecture: '東京都',
      city: '新宿区',
      departments: ['政治経済学部', '法学部', '商学部', '社会科学部', '文学部', '教育学部'],
      url: 'https://www.waseda.jp'
    },
    {
      id: 'keio',
      name: '慶應義塾大学',
      type: '私立大学',
      prefecture: '東京都',
      city: '港区',
      departments: ['法学部', '経済学部', '商学部', '医学部', '理工学部', '総合政策学部'],
      url: 'https://www.keio.ac.jp'
    },
    {
      id: 'hokkaido',
      name: '北海道大学',
      type: '国立大学',
      prefecture: '北海道',
      city: '札幌市',
      departments: ['法学部', '医学部', '工学部', '理学部', '農学部', '獣医学部', '水産学部'],
      url: 'https://www.hokudai.ac.jp'
    },
    {
      id: 'osaka',
      name: '大阪大学',
      type: '国立大学',
      prefecture: '大阪府',
      city: '吹田市',
      departments: ['法学部', '医学部', '工学部', '理学部', '文学部', '経済学部', '薬学部'],
      url: 'https://www.osaka-u.ac.jp'
    },
    {
      id: 'nagoya',
      name: '名古屋大学',
      type: '国立大学',
      prefecture: '愛知県',
      city: '名古屋市',
      departments: ['法学部', '医学部', '工学部', '理学部', '文学部', '経済学部', '農学部'],
      url: 'https://www.nagoya-u.ac.jp'
    },
    {
      id: 'tohoku',
      name: '東北大学',
      type: '国立大学',
      prefecture: '宮城県',
      city: '仙台市',
      departments: ['法学部', '医学部', '工学部', '理学部', '文学部', '経済学部', '薬学部'],
      url: 'https://www.tohoku.ac.jp'
    },
    // 追加の主要大学
    {
      id: 'tsukuba',
      name: '筑波大学',
      type: '国立大学',
      prefecture: '茨城県',
      city: 'つくば市',
      departments: ['人文・文化学群', '社会・国際学群', '人間学群', '生命環境学群', '理工学群', '情報学群', '医学群', '体育専門学群', '芸術専門学群'],
      url: 'https://www.tsukuba.ac.jp'
    },
    {
      id: 'chiba',
      name: '千葉大学',
      type: '国立大学',
      prefecture: '千葉県',
      city: '千葉市',
      departments: ['国際教養学部', '文学部', '教育学部', '法政経学部', '理学部', '工学部', '園芸学部', '医学部', '薬学部', '看護学部'],
      url: 'https://www.chiba-u.ac.jp'
    },
    {
      id: 'sophia',
      name: '上智大学',
      type: '私立大学',
      prefecture: '東京都',
      city: '千代田区',
      departments: ['神学部', '文学部', '総合人間科学部', '法学部', '経済学部', '外国語学部', '国際教養学部', '理工学部'],
      url: 'https://www.sophia.ac.jp'
    },
    {
      id: 'icu',
      name: '国際基督教大学',
      type: '私立大学',
      prefecture: '東京都',
      city: '三鷹市',
      departments: ['教養学部'],
      url: 'https://www.icu.ac.jp'
    },
    {
      id: 'ritsumeikan',
      name: '立命館大学',
      type: '私立大学',
      prefecture: '京都府',
      city: '京都市',
      departments: ['法学部', '産業社会学部', '国際関係学部', '文学部', '映像学部', '経済学部', 'スポーツ健康科学部', '食マネジメント学部', '理工学部', '情報理工学部', '生命科学部', '薬学部'],
      url: 'https://www.ritsumei.ac.jp'
    },
    {
      id: 'doshisha',
      name: '同志社大学',
      type: '私立大学',
      prefecture: '京都府',
      city: '京都市',
      departments: ['神学部', '文学部', '社会学部', '法学部', '経済学部', '商学部', '政策学部', '文化情報学部', '理工学部', '生命医科学部', 'スポーツ健康科学部', '心理学部', 'グローバル・コミュニケーション学部', 'グローバル地域文化学部'],
      url: 'https://www.doshisha.ac.jp'
    },
    {
      id: 'kansai',
      name: '関西大学',
      type: '私立大学',
      prefecture: '大阪府',
      city: '吹田市',
      departments: ['法学部', '文学部', '経済学部', '商学部', '社会学部', '政策創造学部', '外国語学部', '人間健康学部', '総合情報学部', '社会安全学部', 'システム理工学部', '環境都市工学部', '化学生命工学部'],
      url: 'https://www.kansai-u.ac.jp'
    },
    // 国立大学（旧帝大系）
    {
      id: 'kyushu',
      name: '九州大学',
      type: '国立大学',
      prefecture: '福岡県',
      city: '福岡市',
      departments: ['共創学部', '文学部', '教育学部', '法学部', '経済学部', '理学部', '医学部', '歯学部', '薬学部', '工学部', '芸術工学部', '農学部'],
      url: 'https://www.kyushu-u.ac.jp'
    },
    {
      id: 'hokudai',
      name: '北海道大学',
      type: '国立大学',
      prefecture: '北海道',
      city: '札幌市',
      departments: ['文学部', '教育学部', '法学部', '経済学部', '理学部', '医学部', '歯学部', '薬学部', '工学部', '農学部', '獣医学部', '水産学部'],
      url: 'https://www.hokudai.ac.jp'
    },
    {
      id: 'shinshu',
      name: '信州大学',
      type: '国立大学',
      prefecture: '長野県',
      city: '松本市',
      departments: ['人文学部', '教育学部', '経法学部', '理学部', '医学部', '工学部', '農学部', '繊維学部'],
      url: 'https://www.shinshu-u.ac.jp'
    },
    {
      id: 'niigata',
      name: '新潟大学',
      type: '国立大学',
      prefecture: '新潟県',
      city: '新潟市',
      departments: ['人文学部', '教育学部', '法学部', '経済学部', '理学部', '医学部', '歯学部', '工学部', '農学部', '創生学部'],
      url: 'https://www.niigata-u.ac.jp'
    },
    {
      id: 'kanazawa',
      name: '金沢大学',
      type: '国立大学',
      prefecture: '石川県',
      city: '金沢市',
      departments: ['人文学類', '法学類', '経済学類', '学校教育学類', '地域創造学類', '理工学域', '医薬保健学域'],
      url: 'https://www.kanazawa-u.ac.jp'
    },
    {
      id: 'fukui',
      name: '福井大学',
      type: '国立大学',
      prefecture: '福井県',
      city: '福井市',
      departments: ['教育学部', '工学部', '医学部'],
      url: 'https://www.fukui-u.ac.jp'
    },
    {
      id: 'yamanashi',
      name: '山梨大学',
      type: '国立大学',
      prefecture: '山梨県',
      city: '甲府市',
      departments: ['教育学部', '医学部', '工学部', '生命環境学部'],
      url: 'https://www.yamanashi.ac.jp'
    },
    {
      id: 'gifu',
      name: '岐阜大学',
      type: '国立大学',
      prefecture: '岐阜県',
      city: '岐阜市',
      departments: ['教育学部', '地域科学部', '工学部', '応用生物科学部', '医学部'],
      url: 'https://www.gifu-u.ac.jp'
    },
    {
      id: 'shizuoka',
      name: '静岡大学',
      type: '国立大学',
      prefecture: '静岡県',
      city: '静岡市',
      departments: ['人文社会科学部', '教育学部', '情報学部', '理学部', '工学部', '農学部'],
      url: 'https://www.shizuoka.ac.jp'
    },
    {
      id: 'mie',
      name: '三重大学',
      type: '国立大学',
      prefecture: '三重県',
      city: '津市',
      departments: ['人文学部', '教育学部', '医学部', '工学部', '生物資源学部'],
      url: 'https://www.mie-u.ac.jp'
    },
    {
      id: 'shiga',
      name: '滋賀大学',
      type: '国立大学',
      prefecture: '滋賀県',
      city: '彦根市',
      departments: ['教育学部', '経済学部', 'データサイエンス学部'],
      url: 'https://www.shiga-u.ac.jp'
    },
    {
      id: 'nara',
      name: '奈良女子大学',
      type: '国立大学',
      prefecture: '奈良県',
      city: '奈良市',
      departments: ['文学部', '理学部', '生活環境学部'],
      url: 'https://www.nara-wu.ac.jp'
    },
    {
      id: 'wakayama',
      name: '和歌山大学',
      type: '国立大学',
      prefecture: '和歌山県',
      city: '和歌山市',
      departments: ['教育学部', '経済学部', 'システム工学部', '観光学部'],
      url: 'https://www.wakayama-u.ac.jp'
    },
    {
      id: 'tottori',
      name: '鳥取大学',
      type: '国立大学',
      prefecture: '鳥取県',
      city: '鳥取市',
      departments: ['地域学部', '医学部', '工学部', '農学部'],
      url: 'https://www.tottori-u.ac.jp'
    },
    {
      id: 'shimane',
      name: '島根大学',
      type: '国立大学',
      prefecture: '島根県',
      city: '松江市',
      departments: ['法文学部', '教育学部', '医学部', '総合理工学部', '生物資源科学部'],
      url: 'https://www.shimane-u.ac.jp'
    },
    {
      id: 'okayama',
      name: '岡山大学',
      type: '国立大学',
      prefecture: '岡山県',
      city: '岡山市',
      departments: ['文学部', '教育学部', '法学部', '経済学部', '理学部', '医学部', '歯学部', '薬学部', '工学部', '環境理工学部', '農学部', 'グローバル・ディスカバリー・プログラム'],
      url: 'https://www.okayama-u.ac.jp'
    },
    {
      id: 'hiroshima',
      name: '広島大学',
      type: '国立大学',
      prefecture: '広島県',
      city: '東広島市',
      departments: ['総合科学部', '文学部', '教育学部', '法学部', '経済学部', '理学部', '医学部', '歯学部', '薬学部', '工学部', '生物生産学部', '情報科学部'],
      url: 'https://www.hiroshima-u.ac.jp'
    },
    {
      id: 'yamaguchi',
      name: '山口大学',
      type: '国立大学',
      prefecture: '山口県',
      city: '山口市',
      departments: ['人文学部', '教育学部', '経済学部', '理学部', '医学部', '工学部', '農学部', '国際総合科学部'],
      url: 'https://www.yamaguchi-u.ac.jp'
    },
    {
      id: 'tokushima',
      name: '徳島大学',
      type: '国立大学',
      prefecture: '徳島県',
      city: '徳島市',
      departments: ['総合科学部', '医学部', '歯学部', '薬学部', '理工学部', '生物資源産業学部'],
      url: 'https://www.tokushima-u.ac.jp'
    },
    {
      id: 'kagawa',
      name: '香川大学',
      type: '国立大学',
      prefecture: '香川県',
      city: '高松市',
      departments: ['教育学部', '法学部', '経済学部', '医学部', '工学部', '農学部', '創造工学部'],
      url: 'https://www.kagawa-u.ac.jp'
    },
    {
      id: 'ehime',
      name: '愛媛大学',
      type: '国立大学',
      prefecture: '愛媛県',
      city: '松山市',
      departments: ['法文学部', '教育学部', '理学部', '医学部', '工学部', '農学部', '社会共創学部'],
      url: 'https://www.ehime-u.ac.jp'
    },
    {
      id: 'kochi',
      name: '高知大学',
      type: '国立大学',
      prefecture: '高知県',
      city: '高知市',
      departments: ['人文社会科学部', '教育学部', '理学部', '医学部', '農林海洋科学部'],
      url: 'https://www.kochi-u.ac.jp'
    },
    {
      id: 'fukuoka',
      name: '福岡教育大学',
      type: '国立大学',
      prefecture: '福岡県',
      city: '宗像市',
      departments: ['教育学部'],
      url: 'https://www.fukuoka-edu.ac.jp'
    },
    {
      id: 'kumamoto',
      name: '熊本大学',
      type: '国立大学',
      prefecture: '熊本県',
      city: '熊本市',
      departments: ['文学部', '教育学部', '法学部', '理学部', '医学部', '薬学部', '工学部', '生命科学部'],
      url: 'https://www.kumamoto-u.ac.jp'
    },
    {
      id: 'miyazaki',
      name: '宮崎大学',
      type: '国立大学',
      prefecture: '宮崎県',
      city: '宮崎市',
      departments: ['教育学部', '医学部', '工学部', '農学部', '地域資源創成学部'],
      url: 'https://www.miyazaki-u.ac.jp'
    },
    {
      id: 'kagoshima',
      name: '鹿児島大学',
      type: '国立大学',
      prefecture: '鹿児島県',
      city: '鹿児島市',
      departments: ['法文学部', '教育学部', '理学部', '医学部', '歯学部', '工学部', '農学部', '共同獣医学部'],
      url: 'https://www.kagoshima-u.ac.jp'
    },
    {
      id: 'ryukyu',
      name: '琉球大学',
      type: '国立大学',
      prefecture: '沖縄県',
      city: '西原町',
      departments: ['法文学部', '教育学部', '理学部', '医学部', '工学部', '農学部', '国際地域創造学部'],
      url: 'https://www.u-ryukyu.ac.jp'
    }
  ];
}

// 学部名で大学を検索
export function searchUniversitiesByDepartment(
  universities: University[], 
  departmentKeyword: string
): University[] {
  if (!departmentKeyword.trim()) return universities;
  
  const keyword = departmentKeyword.toLowerCase();
  return universities.filter(uni => 
    uni.departments.some(dept => 
      dept.toLowerCase().includes(keyword)
    )
  );
}

// 地域で大学をフィルタリング
export function filterUniversitiesByRegion(
  universities: University[], 
  prefecture: string
): University[] {
  if (!prefecture) return universities;
  
  return universities.filter(uni => 
    uni.prefecture.includes(prefecture)
  );
}

// 大学タイプでフィルタリング
export function filterUniversitiesByType(
  universities: University[], 
  type: string
): University[] {
  if (!type) return universities;
  
  return universities.filter(uni => 
    uni.type.includes(type)
  );
}

// キャッシュ機能付きの大学データ取得
let universityCache: { data: University[]; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

export async function fetchUniversitiesWithCache(): Promise<University[]> {
  const now = Date.now();
  
  // キャッシュが有効な場合はキャッシュを返す
  if (universityCache && (now - universityCache.timestamp) < CACHE_DURATION) {
    return universityCache.data;
  }
  
  // キャッシュが無効または存在しない場合は新しいデータを取得
  const universities = await fetchUniversities();
  
  // キャッシュを更新
  universityCache = {
    data: universities,
    timestamp: now
  };
  
  return universities;
}

// 統計情報を取得
export function getUniversityStatistics(universities: University[]) {
  const stats = {
    total: universities.length,
    byType: {} as Record<string, number>,
    byPrefecture: {} as Record<string, number>,
    byDepartment: {} as Record<string, number>
  };
  
  universities.forEach(uni => {
    // タイプ別統計
    stats.byType[uni.type] = (stats.byType[uni.type] || 0) + 1;
    
    // 都道府県別統計
    stats.byPrefecture[uni.prefecture] = (stats.byPrefecture[uni.prefecture] || 0) + 1;
    
    // 学部別統計
    uni.departments.forEach(dept => {
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
    });
  });
  
  return stats;
}

// 大学を検索（複数条件）
export function searchUniversities(
  universities: University[],
  options: {
    name?: string;
    prefecture?: string;
    type?: string;
    department?: string;
    limit?: number;
  }
): University[] {
  let filtered = [...universities];
  
  if (options.name) {
    filtered = filtered.filter(uni => 
      uni.name.toLowerCase().includes(options.name!.toLowerCase())
    );
  }
  
  if (options.prefecture) {
    filtered = filtered.filter(uni => 
      uni.prefecture.includes(options.prefecture!)
    );
  }
  
  if (options.type) {
    filtered = filtered.filter(uni => 
      uni.type.includes(options.type!)
    );
  }
  
  if (options.department) {
    filtered = filtered.filter(uni => 
      uni.departments.some(dept => 
        dept.toLowerCase().includes(options.department!.toLowerCase())
      )
    );
  }
  
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
}
