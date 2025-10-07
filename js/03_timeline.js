// ==================== 实验流程构建函数 ====================
// 使用函数构建timeline，确保所有插件和配置已加载
function buildTimeline() {
    const timeline = [];

    // ==================== 环节1：被试姓名录入 ====================
    const nameTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div class="welcome-container">
                <h2>欢迎参与实验！</h2>
                <p style="margin-top: 50px; font-size: 18px;">请输入您的姓名或编号：</p>
                <input type="text" id="subject-name" placeholder="例如：zhangsan">
                <p style="margin-top: 30px; font-size: 16px; color: #6c757d;">输入完成后按 <kbd>空格键</kbd> 继续</p>
            </div>
        `,
        choices: [" "],  // 只接受空格键
        on_load: () => {
            // 设置白色背景
            document.body.style.backgroundColor = "#f8f9fa";
            
            // 监听输入框内容变化
            const nameInput = document.getElementById("subject-name");
            nameInput.addEventListener("input", (e) => {
                GLOBAL_DATA.subjectName = e.target.value.trim();
            });
            
            // 自动聚焦到输入框
            nameInput.focus();
        },
        on_finish: () => {
            // 如果没有输入姓名，使用默认值
            if (!GLOBAL_DATA.subjectName) {
                GLOBAL_DATA.subjectName = `匿名被试_${new Date().getTime()}`;
            }
            // 更新数据日志的第一行
            GLOBAL_DATA.experimentLog[0] = `被试姓名：${GLOBAL_DATA.subjectName}`;
        }
    };
    timeline.push(nameTrial);

    // ==================== 环节2：实验指导语 ====================
    const instructionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div class="instruction-container">
                <h2 style="font-size: 28px;">实验指导语</h2>
                <div class="instruction-text">
                    <p>接下来您将看到 <strong>100 张图片</strong>，请根据您的主观感受对每张图片进行 <strong>美观度评价</strong>。</p>
                    <p>评价没有对错之分，无需考虑"是否合适"，直接按真实感受选择即可。</p>
                    
                    <p style="margin-top: 24px; font-weight: 600; color: #1f2937;">每张图片的呈现流程如下：</p>
                    <p>1. 首先会显示一个 <strong>"+"</strong> 字（注视点），请您注视它；</p>
                    <p>2. 随后显示空屏，短暂过渡后呈现图片；</p>
                    <p>3. 图片将展示 <strong>3秒</strong>，请仔细观看；</p>
                    <p>4. 3秒后，图片下方会出现评分方框，点击对应的数字（1-10），然后点击 <strong>"确定"</strong> 完成评价。</p>
                    
                    <p style="margin-top: 24px; font-weight: 600; color: #1f2937;">评价标准：</p>
                    <p><strong>美观度</strong>：1 = 非常不美观，10 = 非常美观</p>
                    
                    <p style="margin-top: 32px; font-size: 18px; color: #007cba; text-align: center;">
                        按 <kbd>空格键</kbd> 开始实验
                    </p>
                </div>
            </div>
        `,
        choices: [" "],  // 只接受空格键
        post_trial_gap: 500,  // 试次后间隔500ms
        on_load: () => {
            // 保持白色背景
            document.body.style.backgroundColor = "#f8f9fa";
        }
    };
    timeline.push(instructionTrial);

    // ==================== 环节3：过渡提示 ====================
    const startExperimentTransition = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div style="text-align: center; margin-top: 200px; color: #ffffff;">
                <h2 style="font-size: 24px; color: #ffffff;">实验即将开始</h2>
                <p style="margin-top: 20px; font-size: 18px; color: #e5e7eb;">请保持注意力集中</p>
            </div>
        `,
        choices: "NO_KEYS",  // 不接受任何按键
        trial_duration: 1500,  // 自动持续1.5秒
        on_load: () => {
            // 切换到灰色实验背景
            document.body.style.backgroundColor = "#626262";
        }
    };
    timeline.push(startExperimentTransition);

    // ==================== 环节4：100个实验试次（循环生成） ====================
    for (let i = 0; i < IMAGE_LIST.length; i++) {
        const currentImage = IMAGE_LIST[i];

        // ---------- 子环节1：注视点（1秒） ----------
        const fixationTrial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<div class="fixation-point">+</div>`,
            choices: "NO_KEYS",
            trial_duration: EXPERIMENT_CONFIG.fixationDuration,
            post_trial_gap: 0
        };

        // ---------- 子环节2：空屏（0.5秒） ----------
        const blankTrial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<div style="width: 100%; height: 500px;"></div>`,
            choices: "NO_KEYS",
            trial_duration: EXPERIMENT_CONFIG.blankDuration,
            post_trial_gap: 0
        };

        // ---------- 子环节3：图片展示3秒后呈现评分（合并为一个试次） ----------
        const imageRatingTrial = {
            type: window.CustomRatingPlugin,
            imageUrl: currentImage.imageUrl,
            imageHeight: 500,
            imageWidth: 800,
            displayDelay: 3000,  // 3秒后显示评分
            labelLeft: "非常不美观",
            labelRight: "非常美观",
            prompt: "请评价图片的美观度",
            min: 1,
            max: 10,
            post_trial_gap: 300,
            on_finish: (data) => {
                // 记录美观度评分
                currentImage.beautyScore = data.rating;
                // 图片观看时长固定为3000ms
                currentImage.imageViewTime = 3000;
                
                // 将当前试次数据添加到实验日志
                GLOBAL_DATA.experimentLog.push(
                    `${currentImage.imageId}\t${currentImage.imageGroup}\t${currentImage.beautyScore}\t${currentImage.imageViewTime}`
                );
            }
        };

        // 将当前试次的3个子环节加入时间线
        timeline.push(fixationTrial, blankTrial, imageRatingTrial);
    }

    // ==================== 环节5：实验结束页（数据下载） ====================
    const endTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <div style="text-align: center; padding: 50px; background-color: #ffffff; border-radius: 15px; 
                        margin: 100px auto; max-width: 600px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); 
                        border: 1px solid #e9ecef;">
                <h2 style="font-size: 28px; color: #28a745; margin-bottom: 30px;">✓ 实验已完成！</h2>
                <p style="font-size: 18px; margin-bottom: 40px; color: #495057;">感谢您的参与！</p>
                <p style="font-size: 16px; margin-bottom: 30px; color: #6c757d;">
                    请点击下方按钮下载您的实验数据
                </p>
                <button id="js-download-btn">下载实验数据</button>
                <p style="font-size: 14px; margin-top: 20px; color: #9ca3af;">
                    数据将以 TXT 格式保存到本地
                </p>
            </div>
        `,
        choices: "NO_KEYS",
        on_load: () => {
            // 恢复白色背景
            document.body.style.backgroundColor = "#f8f9fa";
            
            // 添加下载按钮事件（延迟100ms确保DOM加载完成）
            setTimeout(() => {
                document.getElementById("js-download-btn").addEventListener("click", () => {
                    // 将数据数组转换为文本
                    const dataText = GLOBAL_DATA.experimentLog.join("\n");
                    
                    // 创建Blob对象
                    const blob = new Blob([dataText], { type: "text/plain; charset=utf-8" });
                    
                    // 生成文件名（包含被试姓名和时间戳）
                    const timestamp = new Date().toLocaleString().replace(/[:/ ]/g, "-");
                    const fileName = `${GLOBAL_DATA.subjectName}_美观度评分数据_${timestamp}.txt`;
                    
                    // 使用FileSaver.js下载文件
                    saveAs(blob, fileName);
                });
            }, 100);
        }
    };
    timeline.push(endTrial);

    // 返回完整的时间线
    return timeline;
}
