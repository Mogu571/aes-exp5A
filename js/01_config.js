// ==================== 实验全局配置 ====================
const EXPERIMENT_CONFIG = {
    imageFolder: "./artpic/",       // 图片文件夹路径（相对路径）
    totalTrials: 100,               // 总试次数（100张图片）
    fixationDuration: 1000,         // 注视点持续时长（毫秒）
    blankDuration: 500,             // 空屏持续时长（毫秒）
    bgColor: "#626262",             // 实验背景色（灰色）
    textColor: "#ffffff"            // 文本颜色（白色）
};

// ==================== 生成图片列表 ====================
// 根据totalTrials自动生成图片列表
// 分组规则：1-30为第一组，31-60为第二组，61-100为第三组
let IMAGE_LIST = [];
for (let i = 1; i <= EXPERIMENT_CONFIG.totalTrials; i++) {
    // 确定分组
    let group;
    if (i <= 30) {
        group = 1;
    } else if (i <= 60) {
        group = 2;
    } else {
        group = 3;
    }
    
    IMAGE_LIST.push({
        imageId: i,                                             // 图片序号（1-100）
        imageGroup: group,                                      // 图片分组（1/2/3）
        imageUrl: EXPERIMENT_CONFIG.imageFolder + i + ".png",   // 图片完整路径
        imageViewTime: 0,                                       // 图片观看时长（毫秒，后续记录）
        beautyScore: 0                                          // 美观度评分（1-10，后续记录）
    });
}

// 图片顺序在 04_main.js 中打乱，分组信息保留

// ==================== 全局数据存储 ====================
const GLOBAL_DATA = {
    subjectName: "",                // 被试姓名（在欢迎页面录入）
    experimentLog: [                // 实验数据日志（最终导出为TXT文件）
        "被试姓名：待录入",
        "图片序号\t组别\t美观度评分(1-10)\t观看时长(ms)"
    ]
};
