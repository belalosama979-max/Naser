/**
 * pathsData.js
 * Complete data for both historical paths to Jerusalem.
 * Path 1: Iraqi Route (البصرة → القدس)
 * Path 2: Levantine Route (صور → القدس)
 *
 * Each node has:
 *  id        — unique identifier
 *  name      — city/region name (Arabic)
 *  subtitle  — historical sub-description
 *  type      — 'main' | 'sub' | 'destination'
 *  progress  — percentage position on route (0–100)
 *  x, y      — SVG coordinates (viewBox: 0 0 1400 900)
 *  desc      — short historical note
 */

export const MAP_VIEWBOX = { width: 1400, height: 900 };

// Jerusalem shared destination
const JERUSALEM = {
  id: 'dest',
  name: 'القدس',
  subtitle: 'نقطة التقاء المسارَين',
  type: 'destination',
  progress: 100,
  x: 700,
  y: 820,
  desc: 'هدف صلاح الدين الأعظم — 583 هـ / 1187 م',
};

export const pathsData = {
  // ═══════════════════════════════════════════════
  // المسار الأول — الطريق العراقي
  // البصرة → الأبلة → الكوفة → ... → القدس
  // ═══════════════════════════════════════════════
  path1: [
    {
      id: 'p1_1',
      name: 'البصرة',
      subtitle: 'منطقة الأبلة',
      type: 'main',
      progress: 0,
      x: 1260,
      y: 75,
      desc: 'بوابة العراق الجنوبية والمنطلق الأول',
    },
    {
      id: 'p1_2',
      name: 'منطقة الأبلة',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 7,
      x: 1220,
      y: 155,
      desc: 'ميناء الأبلة التاريخي على شط العرب',
    },
    {
      id: 'p1_3',
      name: 'الكوفة',
      subtitle: 'منطقة القادسية',
      type: 'main',
      progress: 14,
      x: 1175,
      y: 235,
      desc: 'حاضرة العراق وأحد أعظم مراكز الحضارة الإسلامية',
    },
    {
      id: 'p1_4',
      name: 'منطقة القادسية',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 21,
      x: 1125,
      y: 310,
      desc: 'ميدان المعركة الفاصلة في التاريخ الإسلامي',
    },
    {
      id: 'p1_5',
      name: 'بغداد',
      subtitle: 'منطقة النهروان',
      type: 'main',
      progress: 28,
      x: 1070,
      y: 378,
      desc: 'عاصمة الخلافة العباسية ومدينة السلام',
    },
    {
      id: 'p1_6',
      name: 'منطقة النهروان',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 35,
      x: 1010,
      y: 438,
      desc: 'نهروان التاريخية على ضفاف دجلة',
    },
    {
      id: 'p1_7',
      name: 'تكريت',
      subtitle: 'منطقة سامراء',
      type: 'main',
      progress: 42,
      x: 950,
      y: 492,
      desc: 'مدينة صلاح الدين الأيوبي الأصل ومنبته',
    },
    {
      id: 'p1_8',
      name: 'منطقة سامراء',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 50,
      x: 890,
      y: 540,
      desc: 'سامراء العريقة ذات المنارة الملوية',
    },
    {
      id: 'p1_9',
      name: 'الموصل',
      subtitle: 'منطقة سنجار',
      type: 'main',
      progress: 57,
      x: 838,
      y: 578,
      desc: 'درة شمال العراق على ضفاف نهر دجلة',
    },
    {
      id: 'p1_10',
      name: 'منطقة سنجار',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 64,
      x: 800,
      y: 612,
      desc: 'جبال سنجار الحاجزة بين الشام والعراق',
    },
    {
      id: 'p1_11',
      name: 'حلب',
      subtitle: 'منطقة جبل سمعان',
      type: 'main',
      progress: 71,
      x: 772,
      y: 645,
      desc: 'حلب الشهباء قاعدة الشمال الشامي',
    },
    {
      id: 'p1_12',
      name: 'منطقة جبل سمعان',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 78,
      x: 752,
      y: 678,
      desc: 'جبل سمعان التاريخي شمال غرب حلب',
    },
    {
      id: 'p1_13',
      name: 'دمشق',
      subtitle: 'منطقة الغوطة',
      type: 'main',
      progress: 85,
      x: 735,
      y: 716,
      desc: 'دمشق الشام عاصمة الدولة الأيوبية',
    },
    {
      id: 'p1_14',
      name: 'منطقة الغوطة',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 92,
      x: 718,
      y: 766,
      desc: 'غوطة دمشق الخضراء بساتينها وأنهارها',
    },
    JERUSALEM,
  ],

  // ═══════════════════════════════════════════════
  // المسار الثاني — الطريق الشامي الساحلي
  // صور → رأس العين → عكا → ... → القدس
  // ═══════════════════════════════════════════════
  path2: [
    {
      id: 'p2_1',
      name: 'صور',
      subtitle: 'منطقة رأس العين',
      type: 'main',
      progress: 0,
      x: 140,
      y: 75,
      desc: 'مدينة صور الساحلية الفينيقية العريقة',
    },
    {
      id: 'p2_2',
      name: 'منطقة رأس العين',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 7,
      x: 178,
      y: 155,
      desc: 'ينابيع رأس العين على شاطئ المتوسط',
    },
    {
      id: 'p2_3',
      name: 'عكا',
      subtitle: 'منطقة وادي الصليب',
      type: 'main',
      progress: 14,
      x: 222,
      y: 235,
      desc: 'ثغر المتوسط وميناء الشام الكبير',
    },
    {
      id: 'p2_4',
      name: 'منطقة وادي الصليب',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 21,
      x: 272,
      y: 310,
      desc: 'وادي الصليب بين عكا وحيفا',
    },
    {
      id: 'p2_5',
      name: 'حيفا',
      subtitle: 'منطقة جبل الكرمل',
      type: 'main',
      progress: 28,
      x: 328,
      y: 378,
      desc: 'حيفا تحت سفح الكرمل على خليج عكا',
    },
    {
      id: 'p2_6',
      name: 'منطقة جبل الكرمل',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 35,
      x: 385,
      y: 438,
      desc: 'جبل الكرمل الأخضر المطل على المتوسط',
    },
    {
      id: 'p2_7',
      name: 'نابلس',
      subtitle: 'منطقة بلاطة',
      type: 'main',
      progress: 42,
      x: 442,
      y: 492,
      desc: 'نابلس قلب جبال فلسطين الوسطى',
    },
    {
      id: 'p2_8',
      name: 'منطقة بلاطة',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 50,
      x: 492,
      y: 540,
      desc: 'تل بلاطة الأثري قرب نابلس',
    },
    {
      id: 'p2_9',
      name: 'الرملة',
      subtitle: 'منطقة اللطرون',
      type: 'main',
      progress: 57,
      x: 538,
      y: 578,
      desc: 'الرملة المدينة التي بناها العرب في فلسطين',
    },
    {
      id: 'p2_10',
      name: 'منطقة اللطرون',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 64,
      x: 575,
      y: 612,
      desc: 'حصن اللطرون الاستراتيجي على طريق القدس',
    },
    {
      id: 'p2_11',
      name: 'اللد',
      subtitle: 'منطقة بيت نبالا',
      type: 'main',
      progress: 71,
      x: 608,
      y: 645,
      desc: 'اللد المدينة الفلسطينية القديمة',
    },
    {
      id: 'p2_12',
      name: 'منطقة بيت نبالا',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 78,
      x: 635,
      y: 678,
      desc: 'قرية بيت نبالا بين اللد وعسقلان',
    },
    {
      id: 'p2_13',
      name: 'عسقلان',
      subtitle: 'منطقة المجدل',
      type: 'main',
      progress: 85,
      x: 658,
      y: 716,
      desc: 'عروس سواحل الشام وميناء فلسطين',
    },
    {
      id: 'p2_14',
      name: 'منطقة المجدل',
      subtitle: 'محطة على الطريق',
      type: 'sub',
      progress: 92,
      x: 678,
      y: 766,
      desc: 'المجدل بين عسقلان والقدس',
    },
    JERUSALEM,
  ],
};

/**
 * Get all unique nodes including Jerusalem once.
 */
export const getAllNodes = () => {
  const all = [...pathsData.path1, ...pathsData.path2.filter(n => n.id !== 'dest')];
  return all;
};

/**
 * Get path color by pathId.
 */
export const getPathColor = (pathId) => {
  return pathId === 'path1'
    ? { primary: '#2d9a5f', bright: '#52d68a', deep: '#1a5c38', label: 'العراقي' }
    : { primary: '#2a7fc4', bright: '#60b4f5', deep: '#1a4a78', label: 'الشامي' };
};
