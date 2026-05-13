const optionTranslations: Record<string, Record<string, string>> = {
  en: {
    Black: "Black",
    White: "White",
    Gray: "Gray",
    Blue: "Blue",
    Pink: "Pink",
    Beige: "Beige",
    Brown: "Brown",
    Orange: "Orange",
    Red: "Red",
    Yellow: "Yellow",
    Purple: "Purple",
    Green: "Green",
    "Spring/Fall": "Spring/Fall",
    Summer: "Summer",
    Winter: "Winter",
    Casual: "Casual",
    Work: "Work",
    Sports: "Sports",
    Formal: "Formal",
    Party: "Party",
  },
  zh: {
    Black: "黑色",
    White: "白色",
    Gray: "灰色",
    Blue: "蓝色",
    Pink: "粉色",
    Beige: "米色",
    Brown: "棕色",
    Orange: "橙色",
    Red: "红色",
    Yellow: "黄色",
    Purple: "紫色",
    Green: "绿色",
    "Spring/Fall": "春秋",
    Summer: "夏季",
    Winter: "冬季",
    Casual: "休闲",
    Work: "通勤",
    Sports: "运动",
    Formal: "正式",
    Party: "聚会",
  },
};

export const translateOption = (key: string, language: string): string => {
  return optionTranslations[language]?.[key] || optionTranslations.en[key] || key;
};

export default optionTranslations;
