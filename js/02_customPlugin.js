// ==================== 自定义评分插件（方框评分 1-10） ====================
class CustomRatingPlugin {
    constructor(jsPsych) {
        this.jsPsych = jsPsych;
    }

    // 插件信息
    static info = {
        name: 'custom-rating',
        parameters: {
            prompt: {
                type: jsPsych.ParameterType.STRING,
                default: '请评价'
            },
            labelLeft: {
                type: jsPsych.ParameterType.STRING,
                default: '最低'
            },
            labelRight: {
                type: jsPsych.ParameterType.STRING,
                default: '最高'
            },
            min: {
                type: jsPsych.ParameterType.INT,
                default: 1
            },
            max: {
                type: jsPsych.ParameterType.INT,
                default: 10
            }
        }
    };

    // 试次执行函数
    trial(display_element, trial) {
        let selectedRating = null;
        const startTime = performance.now();

        // ==================== 构建HTML ====================
        let html = '<div class="rating-container">';
        
        // 评分标题/提示
        html += `<div class="rating-prompt">${trial.prompt}</div>`;
        
        // 评分方框（1-10）
        html += '<div class="rating-boxes">';
        for (let i = trial.min; i <= trial.max; i++) {
            html += `<div class="rating-box" data-rating="${i}">${i}</div>`;
        }
        html += '</div>';
        
        // 左右标签
        html += '<div class="rating-labels">';
        html += `<span>${trial.labelLeft}</span>`;
        html += `<span>${trial.labelRight}</span>`;
        html += '</div>';
        
        // 确定按钮（初始禁用）
        html += '<button class="confirm-button" id="confirm-btn" disabled>确定</button>';
        html += '</div>';

        // 将HTML插入页面
        display_element.innerHTML = html;

        // ==================== 添加交互事件 ====================
        // 获取所有评分方框
        const ratingBoxes = display_element.querySelectorAll('.rating-box');
        
        // 为每个方框添加点击事件
        ratingBoxes.forEach(box => {
            box.addEventListener('click', () => {
                // 移除所有方框的选中状态
                ratingBoxes.forEach(b => b.classList.remove('selected'));
                
                // 为当前点击的方框添加选中状态
                box.classList.add('selected');
                
                // 记录选中的评分
                selectedRating = parseInt(box.dataset.rating);
                
                // 启用确定按钮
                document.getElementById('confirm-btn').disabled = false;
            });
        });

        // 确定按钮点击事件
        document.getElementById('confirm-btn').addEventListener('click', () => {
            if (selectedRating !== null) {
                // 计算反应时
                const endTime = performance.now();
                const rt = endTime - startTime;

                // 保存试次数据
                const trial_data = {
                    rating: selectedRating,     // 评分值（1-10）
                    rt: rt                      // 反应时（毫秒）
                };

                // 清空显示内容
                display_element.innerHTML = '';
                
                // 结束当前试次，进入下一个试次
                this.jsPsych.finishTrial(trial_data);
            }
        });
    }
}

// ==================== 注册插件到全局 ====================
// 将插件暴露到window对象，供timeline使用
window.CustomRatingPlugin = CustomRatingPlugin;
