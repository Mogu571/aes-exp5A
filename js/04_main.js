// ==================== 实验启动核心逻辑 ====================
// 声明全局变量
let jsPsych;

// 等待DOM加载完成后启动实验
document.addEventListener("DOMContentLoaded", () => {
    // 初始化jsPsych配置
    jsPsych = initJsPsych({
        on_finish: () => {
            // 实验完全结束时的回调
            console.log("实验完全结束！");
            console.log("被试姓名：", GLOBAL_DATA.subjectName);
            console.log("实验数据预览：", GLOBAL_DATA.experimentLog.slice(0, 5));
        }
    });

    // 随机打乱图片呈现顺序
    // 使用jsPsych内置的随机化函数
    IMAGE_LIST = jsPsych.randomization.shuffle(IMAGE_LIST);

    // ==================== 预加载所有图片 ====================
    // 提取所有图片URL
    const imagesToPreload = IMAGE_LIST.map(img => img.imageUrl);
    
    // 创建预加载试次
    const preloadTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div style="text-align: center; padding: 50px; background-color: #ffffff; 
                        border-radius: 15px; margin: 100px auto; max-width: 600px; 
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #e9ecef;">
                <h2 style="font-size: 28px; color: #007cba; margin-bottom: 30px;">正在加载实验材料...</h2>
                <div style="width: 80%; height: 20px; background-color: #e0e0e0; border-radius: 10px; 
                            margin: 0 auto; overflow: hidden;">
                    <div id="preload-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); 
                                                       transition: width 0.3s ease;"></div>
                </div>
                <p id="preload-text" style="margin-top: 20px; color: #666; font-size: 16px;">0%</p>
                <p style="margin-top: 10px; color: #999; font-size: 14px;">请稍候，正在加载图片...</p>
            </div>
        `,
        choices: "NO_KEYS",
        on_load: () => {
            document.body.style.backgroundColor = "#f8f9fa";
            
            // 预加载图片
            let loadedCount = 0;
            const totalImages = imagesToPreload.length;
            
            const updateProgress = () => {
                const percentage = Math.round((loadedCount / totalImages) * 100);
                const progressBar = document.getElementById('preload-progress');
                const progressText = document.getElementById('preload-text');
                
                if (progressBar) {
                    progressBar.style.width = percentage + '%';
                }
                if (progressText) {
                    progressText.textContent = percentage + '%';
                }
                
                // 全部加载完成后，等待500ms然后继续
                if (loadedCount === totalImages) {
                    setTimeout(() => {
                        jsPsych.finishTrial();
                    }, 500);
                }
            };
            
            // 加载每张图片
            imagesToPreload.forEach(url => {
                const img = new Image();
                img.onload = () => {
                    loadedCount++;
                    updateProgress();
                };
                img.onerror = () => {
                    console.error('图片加载失败:', url);
                    loadedCount++;
                    updateProgress();
                };
                img.src = url;
            });
        }
    };

    // 构建实验时间线
    const timeline = buildTimeline();
    
    // 将预加载试次插入到时间线最前面（在欢迎页之前）
    timeline.unshift(preloadTrial);

    // 运行实验
    jsPsych.run(timeline);
});
