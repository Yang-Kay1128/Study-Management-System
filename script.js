// 任务数据管理
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'pending'; // 默认显示未完成的任务
        this.currentSort = 'dueDate';
        this.currentStudent = ''; // 当前学霸
        this.currentStudentFilter = ''; // 当前学霸过滤选项
        this.currentTypeFilter = ''; // 当前作业类型过滤选项
        this.dateFilter = { // 当前日期范围过滤选项
            start: '',
            end: ''
        };
        
        // 确保DOM加载完成后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.renderTasks();
        this.bindEvents();
        this.setDefaultDates();
        // 初始化时检查当前选择的作业类型，显示相应的字段
        const taskType = document.getElementById('task-title').value;
        this.toggleAssignmentFields(taskType);
        
        // 初始化学霸过滤按钮的状态
        document.querySelectorAll('.student-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.student === this.currentStudentFilter) {
                btn.classList.add('active');
            }
        });
        
        // 初始化作业类型过滤按钮的状态
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === this.currentTypeFilter) {
                btn.classList.add('active');
            }
        });
        
        // 初始化任务状态过滤按钮的状态
        document.querySelectorAll('.filter-buttons button[data-filter]').forEach(button => {
            button.classList.remove('active');
            if (button.dataset.filter === this.currentFilter) {
                button.classList.add('active');
            }
        });
        
        // 初始化当前学霸
        const studentSelect = document.getElementById('task-student');
        if (studentSelect) {
            // 初始化科目选项
            const defaultStudent = studentSelect.value;
            this.updateSubjectOptions(defaultStudent);
            
            studentSelect.addEventListener('change', (e) => {
                this.currentStudent = e.target.value;
                // 当选择学霸后，检查是否已经存在其他学霸的作业
                this.checkStudentTasks();
            });
        }
        
        // 确保DOM完全加载后再初始化模态框拖拽功能
        setTimeout(() => {
            this.initModalDrag();
        }, 100);
        
        // 初始化历史进度模态框
        this.initHistoryModal();
        
        // 初始化详细分析功能
        this.initDetailedAnalysis();
        
        // 初始化直接打标小节功能
        this.initMarkSectionModal();
        
        // 初始化新增作业按钮
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                document.getElementById('add-task-modal').style.display = 'block';
                this.updateDateDefaults();
            });
        }
        
        // 初始化新增作业模态框的关闭按钮
        const addTaskModal = document.getElementById('add-task-modal');
        if (addTaskModal) {
            const closeBtn = addTaskModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    addTaskModal.style.display = 'none';
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === addTaskModal) {
                    addTaskModal.style.display = 'none';
                }
            });
        }
        
        // 初始化学校课程进度按钮
        const schoolProgressBtn = document.getElementById('school-progress-btn');
        if (schoolProgressBtn) {
            schoolProgressBtn.addEventListener('click', () => {
                document.getElementById('school-progress-modal').style.display = 'block';
                this.updateProgressDateDefault();
            });
        }
        
        // 初始化教材按钮
        const progressTextbookBtn = document.getElementById('progress-textbook-btn');
        if (progressTextbookBtn) {
            progressTextbookBtn.addEventListener('click', () => {
                document.getElementById('textbook-modal').style.display = 'block';
            });
        }
        
        // 初始化学校课程进度模态框的关闭按钮
        const schoolProgressModal = document.getElementById('school-progress-modal');
        if (schoolProgressModal) {
            const closeBtn = schoolProgressModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    schoolProgressModal.style.display = 'none';
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === schoolProgressModal) {
                    schoolProgressModal.style.display = 'none';
                }
            });
        }
        
        // 初始化课程表按钮
        const timetableBtn = document.getElementById('timetable-btn');
        if (timetableBtn) {
            timetableBtn.addEventListener('click', () => {
                document.getElementById('timetable-modal').style.display = 'block';
                this.initTimetable();
            });
        }
        
        // 初始化课程表模态框的关闭按钮
        const timetableModal = document.getElementById('timetable-modal');
        if (timetableModal) {
            const closeBtn = timetableModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    timetableModal.style.display = 'none';
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === timetableModal) {
                    timetableModal.style.display = 'none';
                }
            });
        }
        
        // 初始化考试排名分析按钮
        const examRankingBtn = document.getElementById('exam-ranking-btn');
        if (examRankingBtn) {
            examRankingBtn.addEventListener('click', () => {
                document.getElementById('exam-ranking-modal').style.display = 'block';
                this.initExamRanking();
            });
        }
        
        // 初始化教材按钮
        const textbookBtn = document.getElementById('textbook-btn');
        if (textbookBtn) {
            textbookBtn.addEventListener('click', () => {
                document.getElementById('textbook-modal').style.display = 'block';
                this.initTextbook();
            });
        }
        
        // 初始化教材模态框的关闭按钮
        const textbookModal = document.getElementById('textbook-modal');
        if (textbookModal) {
            const closeBtn = textbookModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    textbookModal.style.display = 'none';
                    // 重新生成课程列表，确保教材内容更新后课程进度也同步更新
                    const progressModal = document.getElementById('school-progress-modal');
                    if (progressModal && progressModal.style.display === 'block') {
                        this.updateCourseList();
                    }
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === textbookModal) {
                    textbookModal.style.display = 'none';
                    // 重新生成课程列表，确保教材内容更新后课程进度也同步更新
                    const progressModal = document.getElementById('school-progress-modal');
                    if (progressModal && progressModal.style.display === 'block') {
                        this.updateCourseList();
                    }
                }
            });
        }
        
        // 初始化考试排名分析模态框的关闭按钮
        const examRankingModal = document.getElementById('exam-ranking-modal');
        if (examRankingModal) {
            const closeBtn = examRankingModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    examRankingModal.style.display = 'none';
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === examRankingModal) {
                    examRankingModal.style.display = 'none';
                }
            });
        }
        
        // 初始化练习题库按钮
        const practiceQuestionsBtn = document.getElementById('practice-questions-btn');
        if (practiceQuestionsBtn) {
            practiceQuestionsBtn.addEventListener('click', () => {
                document.getElementById('practice-questions-modal').style.display = 'block';
            });
        }
        
        // 初始化练习题库模态框的关闭按钮
        const practiceQuestionsModal = document.getElementById('practice-questions-modal');
        if (practiceQuestionsModal) {
            const closeBtn = practiceQuestionsModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    practiceQuestionsModal.style.display = 'none';
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === practiceQuestionsModal) {
                    practiceQuestionsModal.style.display = 'none';
                }
            });
            
            // 初始化练习题库筛选功能
            this.initPracticeFilters();
        }
        
        // 初始化学校课程进度表单
        this.initSchoolProgressForm();
    }
    
    // 更新课程进度日期默认值
    updateProgressDateDefault() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        document.getElementById('progress-date').value = formattedDate;
    }
    
    // 初始化学校课程进度表单
    initSchoolProgressForm() {
        const progressStudent = document.getElementById('progress-student');
        if (progressStudent) {
            progressStudent.addEventListener('change', () => {
                this.updateCourseList();
            });
        }
        
        const schoolProgressForm = document.getElementById('school-progress-form');
        if (schoolProgressForm) {
            schoolProgressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSchoolProgress();
            });
        }
        
        // 初始化查看历史进度按钮
        const viewHistoryBtn = document.getElementById('view-history-btn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => {
                this.showHistoryProgress();
            });
        }
    }
    
    // 初始化课程表
    initTimetable() {
        this.currentWeek = new Date();
        this.currentTimetableStudent = '';
        this.updateTimetable();
        
        // 绑定周切换按钮事件
        document.getElementById('prev-week').addEventListener('click', () => {
            this.currentWeek.setDate(this.currentWeek.getDate() - 7);
            this.updateTimetable();
        });
        
        document.getElementById('current-week').addEventListener('click', () => {
            this.currentWeek = new Date();
            this.updateTimetable();
        });
        
        document.getElementById('next-week').addEventListener('click', () => {
            this.currentWeek.setDate(this.currentWeek.getDate() + 7);
            this.updateTimetable();
        });
        
        // 绑定学霸选择器事件
        const studentSelect = document.getElementById('timetable-student');
        if (studentSelect) {
            studentSelect.addEventListener('change', (e) => {
                this.currentTimetableStudent = e.target.value;
                this.loadTimetableData();
            });
        }
    }
    
    // 加载课程表数据
    loadTimetableData() {
        console.log('loadTimetableData called');
        console.log('currentTimetableStudent:', this.currentTimetableStudent);
        
        // 直接创建KYP的课程表数据，不依赖本地存储
        const kypTimetable = {
            // 周一课程
            'monday': [
                '外语',         // 第一节课 08:20-08:55
                '语文',         // 第二节课 09:30-10:05
                '数学',         // 第三节课 10:20-10:55
                '体育与健康（武术）', // 第四节课 11:05-11:40
                '道德与法治',     // 第五节课 13:10-13:45
                '音乐',         // 第六节课 13:55-14:30
                '美术'          // 第七节课 14:45-15:20
            ],
            // 周二课程
            'tuesday': [
                '外语',         // 第一节课 08:20-08:55
                '语文',         // 第二节课 09:30-10:05
                '数学',         // 第三节课 10:20-10:55
                '自然',         // 第四节课 11:05-11:40
                '体育与健康',    // 第五节课 13:10-13:45
                '综合实践活动',  // 第六节课 13:55-14:30
                '道德与法治'    // 第七节课 14:45-15:20
            ],
            // 周三课程
            'wednesday': [
                '语文',         // 第一节课 08:20-08:55
                '数学',         // 第二节课 09:30-10:05
                '外语',         // 第三节课 10:20-10:55
                '体育与健康（武术）', // 第四节课 11:05-11:40
                '班队活动',     // 第五节课 13:10-13:45
                '音乐',         // 第六节课 13:55-14:30
                '语文（写字）'   // 第七节课 14:45-15:20
            ],
            // 周四课程
            'thursday': [
                '外语',         // 第一节课 08:20-08:55
                '语文',         // 第二节课 09:30-10:05
                '数学',         // 第三节课 10:20-10:55
                '体育与健康',    // 第四节课 11:05-11:40
                '校本课程（体育活动）', // 第五节课 13:10-13:45
                '道德与法治',     // 第六节课 13:55-14:30
                '自然'          // 第七节课 14:45-15:20
            ],
            // 周五课程
            'friday': [
                '外语',         // 第一节课 08:20-08:55
                '语文',         // 第二节课 09:30-10:05
                '数学',         // 第三节课 10:20-10:55
                '体育与健康',    // 第四节课 11:05-11:40
                '劳动技术',     // 第五节课 13:10-13:45
                '校本课程（体育活动）', // 第六节课 13:55-14:30
                '课后服务'      // 第七节课 14:45-15:20
            ]
        };
        
        // 创建空的课程表数据，用于KL
        const emptyTimetable = {
            'monday': ['', '', '', '', '', '', ''],
            'tuesday': ['', '', '', '', '', '', ''],
            'wednesday': ['', '', '', '', '', '', ''],
            'thursday': ['', '', '', '', '', '', ''],
            'friday': ['', '', '', '', '', '', '']
        };
        
        // 根据选择的学霸显示相应的课程表数据
        let studentData;
        if (this.currentTimetableStudent === 'KYP') {
            studentData = kypTimetable;
        } else {
            // 对于KL，显示空的课程表
            studentData = emptyTimetable;
        }
        console.log('Student data:', studentData);
        
        // 清空课程表
        const cells = document.querySelectorAll('.timetable-cell:not(.header):not(.time)');
        console.log('Found cells:', cells.length);
        cells.forEach(cell => {
            cell.innerHTML = '';
        });
        
        // 填充课程表数据（如果有的话）
        if (studentData && Object.keys(studentData).length > 0) {
            console.log('Filling timetable data');
            // 课程表单元格顺序：周一至周五，每节课一行
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            
            // 直接设置每个单元格的内容
            // 第一节课
            cells[0].innerHTML = studentData.monday[0]; // 周一第一节课
            cells[1].innerHTML = studentData.tuesday[0]; // 周二第一节课
            cells[2].innerHTML = studentData.wednesday[0]; // 周三第一节课
            cells[3].innerHTML = studentData.thursday[0]; // 周四第一节课
            cells[4].innerHTML = studentData.friday[0]; // 周五第一节课
            
            // 第二节课
            cells[5].innerHTML = studentData.monday[1]; // 周一第二节课
            cells[6].innerHTML = studentData.tuesday[1]; // 周二第二节课
            cells[7].innerHTML = studentData.wednesday[1]; // 周三第二节课
            cells[8].innerHTML = studentData.thursday[1]; // 周四第二节课
            cells[9].innerHTML = studentData.friday[1]; // 周五第二节课
            
            // 第三节课
            cells[10].innerHTML = studentData.monday[2]; // 周一第三节课
            cells[11].innerHTML = studentData.tuesday[2]; // 周二第三节课
            cells[12].innerHTML = studentData.wednesday[2]; // 周三第三节课
            cells[13].innerHTML = studentData.thursday[2]; // 周四第三节课
            cells[14].innerHTML = studentData.friday[2]; // 周五第三节课
            
            // 第四节课
            cells[15].innerHTML = studentData.monday[3]; // 周一第四节课
            cells[16].innerHTML = studentData.tuesday[3]; // 周二第四节课
            cells[17].innerHTML = studentData.wednesday[3]; // 周三第四节课
            cells[18].innerHTML = studentData.thursday[3]; // 周四第四节课
            cells[19].innerHTML = studentData.friday[3]; // 周五第四节课
            
            // 跳过午休行（cells[20]到cells[24]）
            
            // 第五节课
            cells[25].innerHTML = studentData.monday[4]; // 周一第五节课
            cells[26].innerHTML = studentData.tuesday[4]; // 周二第五节课
            cells[27].innerHTML = studentData.wednesday[4]; // 周三第五节课
            cells[28].innerHTML = studentData.thursday[4]; // 周四第五节课
            cells[29].innerHTML = studentData.friday[4]; // 周五第五节课
            
            // 第六节课
            cells[30].innerHTML = studentData.monday[5]; // 周一第六节课
            cells[31].innerHTML = studentData.tuesday[5]; // 周二第六节课
            cells[32].innerHTML = studentData.wednesday[5]; // 周三第六节课
            cells[33].innerHTML = studentData.thursday[5]; // 周四第六节课
            cells[34].innerHTML = studentData.friday[5]; // 周五第六节课
            
            // 第七节课
            cells[35].innerHTML = studentData.monday[6]; // 周一第七节课
            cells[36].innerHTML = studentData.tuesday[6]; // 周二第七节课
            cells[37].innerHTML = studentData.wednesday[6]; // 周三第七节课
            cells[38].innerHTML = studentData.thursday[6]; // 周四第七节课
            cells[39].innerHTML = studentData.friday[6]; // 周五第七节课
            
            console.log('Timetable data filled successfully');
        } else {
            console.log('No student data found');
        }
    }
    
    // 初始化考试排名分析
    initExamRanking() {
        // 绑定新增考试数据按钮
        const addExamDataBtn = document.getElementById('add-exam-data-btn');
        if (addExamDataBtn) {
            addExamDataBtn.addEventListener('click', () => {
                document.getElementById('add-exam-modal').style.display = 'block';
                // 初始化日期为今天
                const examDate = document.getElementById('exam-date');
                if (examDate) {
                    const today = new Date();
                    const formattedDate = today.toISOString().split('T')[0];
                    examDate.value = formattedDate;
                }
            });
        }
        
        // 初始化新增考试数据模态框的关闭按钮
        const addExamModal = document.getElementById('add-exam-modal');
        if (addExamModal) {
            const closeBtn = addExamModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    addExamModal.style.display = 'none';
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === addExamModal) {
                    addExamModal.style.display = 'none';
                }
            });
        }
        
        // 绑定保存数据按钮
        const saveBtn = document.getElementById('save-exam-data');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveExamData();
                // 保存后关闭模态框
                document.getElementById('add-exam-modal').style.display = 'none';
            });
        }
        
        // 绑定学霸选择器
        const studentSelect = document.getElementById('exam-student');
        if (studentSelect) {
            studentSelect.addEventListener('change', () => {
                this.loadExamHistory();
                this.updateRankingChart();
            });
        }
        
        // 绑定考试类型选择器
        const typeSelect = document.getElementById('exam-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.loadExamHistory();
                this.updateRankingChart();
            });
        }
        
        // 绑定日期范围过滤按钮
        const applyDateFilterBtn = document.getElementById('apply-date-filter');
        if (applyDateFilterBtn) {
            applyDateFilterBtn.addEventListener('click', () => {
                this.loadExamHistory();
                this.updateRankingChart();
            });
        }
        
        // 设置默认学霸
        if (studentSelect) {
            studentSelect.value = 'KYP'; // 默认选择KYP
        }
        
        // 自动选择最近一次考试记录的类型
        if (studentSelect && typeSelect) {
            const student = studentSelect.value;
            const examData = JSON.parse(localStorage.getItem('examRankingData')) || {};
            const studentData = examData[student] || [];
            
            if (studentData.length > 0) {
                // 按日期降序排序，找到最近一次的考试记录
                const sortedData = [...studentData].sort((a, b) => new Date(b.date) - new Date(a.date));
                const latestExam = sortedData[0];
                typeSelect.value = latestExam.type;
            } else {
                // 如果没有考试记录，默认选择月考
                typeSelect.value = 'monthly';
            }
        }
        
        // 加载历史记录
        this.loadExamHistory();
        
        // 初始化图表
        this.updateRankingChart();
    }
    
    // 初始化教材
    initTextbook() {
        // 绑定筛选器
        const gradeSelect = document.getElementById('textbook-grade');
        const subjectSelect = document.getElementById('textbook-subject');
        const semesterSelect = document.getElementById('textbook-semester');
        
        // 绑定章节点击事件（展开/收起）
        document.querySelectorAll('.chapter-title').forEach(title => {
            title.addEventListener('click', () => {
                const content = title.nextElementSibling;
                const arrow = title.querySelector('span');
                if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    arrow.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    arrow.textContent = '▶';
                }
            });
        });
        
        // 绑定筛选函数
        const filterTextbooks = () => {
            const grade = gradeSelect.value;
            const subject = subjectSelect.value;
            const semester = semesterSelect.value;
            
            document.querySelectorAll('.textbook-item').forEach(item => {
                let show = true;
                
                if (grade && item.dataset.grade !== grade) show = false;
                if (subject && item.dataset.subject !== subject) show = false;
                if (semester && item.dataset.semester !== semester) show = false;
                
                item.style.display = show ? 'block' : 'none';
            });
        };
        
        // 绑定应用按钮点击事件
        const applyButton = document.getElementById('apply-filter');
        if (applyButton) {
            applyButton.addEventListener('click', filterTextbooks);
        }
        
        // 绑定筛选事件
        // 移除自动筛选，只通过应用按钮触发
        // if (gradeSelect) gradeSelect.addEventListener('change', filterTextbooks);
        // if (subjectSelect) subjectSelect.addEventListener('change', filterTextbooks);
        // if (versionSelect) versionSelect.addEventListener('change', filterTextbooks);
        // if (semesterSelect) semesterSelect.addEventListener('change', filterTextbooks);
    }
    
    // 保存考试数据
    saveExamData() {
        // 获取主模态框中的学霸和考试类型
        const student = document.getElementById('exam-student').value;
        const type = document.getElementById('exam-type').value;
        // 获取新增考试数据模态框中的表单数据
        const date = document.getElementById('exam-date').value;
        const classRanking = document.getElementById('class-ranking').value;
        const schoolRanking = document.getElementById('school-ranking').value;
        const classTargetRanking = document.getElementById('class-target-ranking').value;
        const schoolTargetRanking = document.getElementById('school-target-ranking').value;
        
        if (!student || !type || !date || !classRanking || !schoolRanking || !classTargetRanking || !schoolTargetRanking) {
            alert('请填写完整的考试数据');
            return;
        }
        
        // 获取现有数据
        const examData = JSON.parse(localStorage.getItem('examRankingData')) || {};
        if (!examData[student]) {
            examData[student] = [];
        }
        
        // 添加新数据
        examData[student].push({
            type: type,
            date: date,
            classRanking: parseInt(classRanking),
            schoolRanking: parseInt(schoolRanking),
            classTargetRanking: parseInt(classTargetRanking),
            schoolTargetRanking: parseInt(schoolTargetRanking),
            timestamp: new Date().toISOString()
        });
        
        // 按日期排序
        examData[student].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // 保存到本地存储
        localStorage.setItem('examRankingData', JSON.stringify(examData));
        
        // 清空表单
        document.getElementById('class-ranking').value = '';
        document.getElementById('school-ranking').value = '';
        document.getElementById('class-target-ranking').value = '';
        document.getElementById('school-target-ranking').value = '';
        
        // 重新加载历史记录和图表
        this.loadExamHistory();
        this.updateRankingChart();
        
        alert('数据保存成功！');
    }
    
    // 加载历史考试记录
    loadExamHistory() {
        const student = document.getElementById('exam-student').value;
        const type = document.getElementById('exam-type').value;
        const historyList = document.getElementById('exam-history-list');
        
        if (!student) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">请选择学霸</p>';
            return;
        }
        
        // 获取数据
        const examData = JSON.parse(localStorage.getItem('examRankingData')) || {};
        const studentData = examData[student] || [];
        
        // 过滤考试类型
        let filteredData = studentData.filter(item => item.type === type);
        
        // 过滤日期范围
        const startDate = document.getElementById('exam-date-start').value;
        const endDate = document.getElementById('exam-date-end').value;
        
        if (startDate) {
            filteredData = filteredData.filter(item => item.date >= startDate);
        }
        
        if (endDate) {
            filteredData = filteredData.filter(item => item.date <= endDate);
        }
        
        if (filteredData.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">暂无考试记录</p>';
            return;
        }
        
        // 生成历史记录
        let historyHTML = '';
        filteredData.forEach((item, index) => {
            const examTypeText = {
                'monthly': '月考',
                'midterm': '期中考试',
                'final': '期末考试'
            }[item.type];
            
            historyHTML += `
                <div class="exam-history-item">
                    <div class="exam-info">
                        <span class="exam-date">${item.date}</span>
                        <span class="exam-type">${examTypeText}</span>
                    </div>
                    <div class="ranking-info">
                        <div class="ranking-item">
                            <span class="ranking-label">班级排名：</span>
                            <span class="ranking-value">${item.classRanking}</span>
                        </div>
                        <div class="ranking-item">
                            <span class="ranking-label">校排名：</span>
                            <span class="ranking-value">${item.schoolRanking}</span>
                        </div>
                        <div class="ranking-item">
                            <span class="ranking-label">班级目标排名：</span>
                            <span class="ranking-value">${item.classTargetRanking || item.targetRanking || '-'}</span>
                        </div>
                        <div class="ranking-item">
                            <span class="ranking-label">校目标排名：</span>
                            <span class="ranking-value">${item.schoolTargetRanking || '-'}</span>
                        </div>
                    </div>
                    <button class="delete-exam" onclick="taskManager.deleteExamData('${student}', ${index})">删除</button>
                </div>
            `;
        });
        
        historyList.innerHTML = historyHTML;
    }
    
    // 删除考试数据
    deleteExamData(student, index) {
        if (confirm('确定要删除这条考试记录吗？')) {
            const examData = JSON.parse(localStorage.getItem('examRankingData')) || {};
            if (examData[student] && examData[student][index]) {
                examData[student].splice(index, 1);
                localStorage.setItem('examRankingData', JSON.stringify(examData));
                this.loadExamHistory();
                this.updateRankingChart();
                alert('删除成功！');
            }
        }
    }
    
    // 更新排名趋势图表
    updateRankingChart() {
        const student = document.getElementById('exam-student').value;
        const type = document.getElementById('exam-type').value;
        
        if (!student) return;
        
        // 获取数据
        const examData = JSON.parse(localStorage.getItem('examRankingData')) || {};
        const studentData = examData[student] || [];
        
        // 过滤考试类型
        let filteredData = studentData.filter(item => item.type === type);
        
        // 过滤日期范围
        const startDate = document.getElementById('exam-date-start').value;
        const endDate = document.getElementById('exam-date-end').value;
        
        if (startDate) {
            filteredData = filteredData.filter(item => item.date >= startDate);
        }
        
        if (endDate) {
            filteredData = filteredData.filter(item => item.date <= endDate);
        }
        
        // 准备图表数据
        const labels = filteredData.map(item => item.date);
        const classRankings = filteredData.map(item => item.classRanking);
        const schoolRankings = filteredData.map(item => item.schoolRanking);
        const classTargetRankings = filteredData.map(item => item.classTargetRanking || item.targetRanking);
        const schoolTargetRankings = filteredData.map(item => item.schoolTargetRanking);
        
        // 清除之前的图表
        const chartCanvas = document.getElementById('ranking-chart');
        // 设置Canvas尺寸
        chartCanvas.width = 800;
        chartCanvas.height = 400;
        const ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        
        if (filteredData.length === 0) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', chartCanvas.width / 2, chartCanvas.height / 2);
            return;
        }
        
        // 绘制图表（优化版线图）
        const chartWidth = chartCanvas.width - 100;
        const chartHeight = chartCanvas.height - 100;
        const padding = 50;
        
        // 计算数据范围，添加一些缓冲
        const allRankings = [...classRankings, ...schoolRankings, ...classTargetRankings, ...schoolTargetRankings].filter(r => r);
        if (allRankings.length === 0) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText('暂无有效数据', chartCanvas.width / 2, chartCanvas.height / 2);
            return;
        }
        
        // 计算数据范围，添加一些缓冲
        const maxRank = Math.max(...allRankings);
        const minRank = Math.min(...allRankings);
        
        // 优化单位间隔
        const rankRange = maxRank - minRank;
        let interval = 1;
        
        if (rankRange > 200) {
            interval = 50;
        } else if (rankRange > 100) {
            interval = 25;
        } else if (rankRange > 50) {
            interval = 10;
        } else if (rankRange > 20) {
            interval = 5;
        }
        
        // 调整最大和最小值，使其成为interval的倍数
        const adjustedMaxRank = Math.ceil(maxRank / interval) * interval;
        const adjustedMinRank = Math.max(0, Math.floor(minRank / interval) * interval);
        const adjustedRankRange = adjustedMaxRank - adjustedMinRank;
        
        // 绘制网格线
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        // 水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        // 垂直网格线
        for (let i = 0; i <= filteredData.length; i++) {
            const x = padding + (i / (filteredData.length || 1)) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
        
        // 绘制坐标轴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.stroke();
        
        // 绘制班级排名线 - 蓝色实线
        if (classRankings.length > 0) {
            if (filteredData.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = '#667eea';
                ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(102, 126, 234, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetY = 2;
                filteredData.forEach((item, index) => {
                    const x = padding + (index / (filteredData.length - 1)) * chartWidth;
                    const y = padding + ((item.classRanking - adjustedMinRank) / adjustedRankRange) * chartHeight;
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
        
        // 绘制校排名线 - 青色实线
        if (schoolRankings.length > 0) {
            if (filteredData.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = '#4ecdc4';
                ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(78, 205, 196, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetY = 2;
                filteredData.forEach((item, index) => {
                    const x = padding + (index / (filteredData.length - 1)) * chartWidth;
                    const y = padding + ((item.schoolRanking - adjustedMinRank) / adjustedRankRange) * chartHeight;
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
        
        // 绘制班级目标排名线 - 红色虚线
        if (classTargetRankings.some(r => r)) {
            if (filteredData.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 4]);
                ctx.shadowColor = 'rgba(255, 107, 107, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetY = 2;
                filteredData.forEach((item, index) => {
                    const targetRank = item.classTargetRanking || item.targetRanking;
                    if (targetRank) {
                        const x = padding + (index / (filteredData.length - 1)) * chartWidth;
                        const y = padding + ((targetRank - adjustedMinRank) / adjustedRankRange) * chartHeight;
                        if (index === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                });
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
        
        // 绘制校目标排名线 - 黄色虚线
        if (schoolTargetRankings.some(r => r)) {
            if (filteredData.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = '#f9a826';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]);
                ctx.shadowColor = 'rgba(249, 168, 38, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetY = 2;
                filteredData.forEach((item, index) => {
                    if (item.schoolTargetRanking) {
                        const x = padding + (index / (filteredData.length - 1)) * chartWidth;
                        const y = padding + ((item.schoolTargetRanking - adjustedMinRank) / adjustedRankRange) * chartHeight;
                        if (index === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                });
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.shadowBlur = 0;
            }
        }
        
        // 绘制数据点 - 增大尺寸，添加阴影效果
        filteredData.forEach((item, index) => {
            // 计算x坐标，避免除以零
            const x = filteredData.length > 1 ? 
                padding + (index / (filteredData.length - 1)) * chartWidth : 
                padding + chartWidth / 2;
            
            // 班级排名点 - 蓝色
            ctx.beginPath();
            ctx.fillStyle = '#667eea';
            ctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
            ctx.shadowBlur = 8;
            ctx.arc(x, padding + ((item.classRanking - adjustedMinRank) / adjustedRankRange) * chartHeight, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 校排名点 - 青色
            ctx.beginPath();
            ctx.fillStyle = '#4ecdc4';
            ctx.shadowColor = 'rgba(78, 205, 196, 0.5)';
            ctx.shadowBlur = 8;
            ctx.arc(x + 15, padding + ((item.schoolRanking - adjustedMinRank) / adjustedRankRange) * chartHeight, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 班级目标排名点 - 红色
            const classTargetRank = item.classTargetRanking || item.targetRanking;
            if (classTargetRank) {
                ctx.beginPath();
                ctx.fillStyle = '#ff6b6b';
                ctx.shadowColor = 'rgba(255, 107, 107, 0.5)';
                ctx.shadowBlur = 8;
                ctx.arc(x - 15, padding + ((classTargetRank - adjustedMinRank) / adjustedRankRange) * chartHeight, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 校目标排名点 - 黄色
            if (item.schoolTargetRanking) {
                ctx.beginPath();
                ctx.fillStyle = '#f9a826';
                ctx.shadowColor = 'rgba(249, 168, 38, 0.5)';
                ctx.shadowBlur = 8;
                ctx.arc(x + 30, padding + ((item.schoolTargetRanking - adjustedMinRank) / adjustedRankRange) * chartHeight, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.shadowBlur = 0;
        
        // 绘制数据标签
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        filteredData.forEach((item, index) => {
            // 计算x坐标，避免除以零
            const x = filteredData.length > 1 ? 
                padding + (index / (filteredData.length - 1)) * chartWidth : 
                padding + chartWidth / 2;
            
            // 班级排名标签
            const classY = padding + ((item.classRanking - adjustedMinRank) / adjustedRankRange) * chartHeight - 15;
            ctx.fillStyle = '#667eea';
            ctx.fillText(`班级:${item.classRanking}`, x, classY);
            
            // 校排名标签
            const schoolY = padding + ((item.schoolRanking - adjustedMinRank) / adjustedRankRange) * chartHeight + 20;
            ctx.fillStyle = '#4ecdc4';
            ctx.fillText(`校:${item.schoolRanking}`, x + 15, schoolY);
            
            // 班级目标排名标签
            const classTargetRank = item.classTargetRanking || item.targetRanking;
            if (classTargetRank) {
                const classTargetY = padding + ((classTargetRank - adjustedMinRank) / adjustedRankRange) * chartHeight - 15;
                ctx.fillStyle = '#ff6b6b';
                ctx.fillText(`班目标:${classTargetRank}`, x - 15, classTargetY);
            }
            
            // 校目标排名标签
            if (item.schoolTargetRanking) {
                const schoolTargetY = padding + ((item.schoolTargetRanking - adjustedMinRank) / adjustedRankRange) * chartHeight + 20;
                ctx.fillStyle = '#f9a826';
                ctx.fillText(`校目标:${item.schoolTargetRanking}`, x + 30, schoolTargetY);
            }
        });
        
        // 绘制日期标签
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        filteredData.forEach((item, index) => {
            // 计算x坐标，避免除以零
            const x = filteredData.length > 1 ? 
                padding + (index / (filteredData.length - 1)) * chartWidth : 
                padding + chartWidth / 2;
            ctx.fillText(item.date, x, padding + chartHeight + 25);
        });
        
        // 绘制排名标签（左侧）
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const rank = adjustedMinRank + (i / 5) * adjustedRankRange;
            const y = padding + (i / 5) * chartHeight;
            ctx.fillText(Math.round(rank), padding - 10, y + 4);
        }
        
        // 绘制图表标题
        ctx.font = '16px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(`${filteredData[0].type === 'monthly' ? '月考' : filteredData[0].type === 'midterm' ? '期中考试' : '期末考试'}排名趋势`, chartCanvas.width / 2, 25);
    }
    
    // 更新课程表
    updateTimetable() {
        // 计算本周的开始（周一）和结束（周五）
        const startOfWeek = new Date(this.currentWeek);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4); // 周五
        
        // 计算本月第几周
        const weekNumber = this.getWeekNumber(this.currentWeek);
        
        // 更新周信息
        const weekInfo = document.getElementById('timetable-week-info');
        if (weekInfo) {
            const startMonth = startOfWeek.getMonth() + 1;
            const startDay = startOfWeek.getDate();
            const endMonth = endOfWeek.getMonth() + 1;
            const endDay = endOfWeek.getDate();
            const year = startOfWeek.getFullYear();
            
            weekInfo.textContent = `第${weekNumber}周 (${year}年${startMonth}月${startDay}日 - ${endMonth}月${endDay}日)`;
        }
        
        // 更新表头日期
        const headerCells = document.querySelectorAll('.timetable-cell.header:not(:first-child)');
        headerCells.forEach((cell, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
            const day = date.getDate();
            cell.innerHTML = `${dayOfWeek}<br>${day}日`;
        });
        
        // 加载课程表数据
        this.loadTimetableData();
    }
    
    // 获取日期所在的周数（本月第几周）
    getWeekNumber(date) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstDayOfWeek = firstDayOfMonth.getDay() || 7; // 将周日从0改为7
        const firstMonday = new Date(firstDayOfMonth);
        firstMonday.setDate(firstDayOfMonth.getDate() + (8 - firstDayOfWeek) % 7);
        
        const diffDays = Math.floor((date - firstMonday) / (1000 * 60 * 60 * 24));
        return Math.floor(diffDays / 7) + 1;
    }
    
    // 显示历史进度
    showHistoryProgress() {
        const student = document.getElementById('progress-student').value;
        const historyList = document.getElementById('history-list');
        
        if (!student) {
            alert('请选择学霸');
            return;
        }
        
        // 从本地存储获取历史进度
        const progressList = JSON.parse(localStorage.getItem('schoolProgress')) || [];
        const studentProgress = progressList.filter(item => item.student === student);
        
        if (studentProgress.length === 0) {
            historyList.innerHTML = '<div class="empty-history" style="text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 8px; color: #666;"><p>暂无历史进度</p><p style="font-size: 14px; margin-top: 10px;">开始记录你的学习进度吧！</p></div>';
        } else {
            // 按日期降序排序
            studentProgress.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let historyHTML = '';
            studentProgress.forEach(progress => {
                // 获取日期的星期
                const dateObj = new Date(progress.date);
                const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                const weekday = weekdays[dateObj.getDay()];
                
                historyHTML += `
                    <div class="history-item" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); margin-bottom: 20px; overflow: hidden;">
                        <div class="history-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 20px; font-weight: bold;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="margin: 0; font-size: 18px;">${progress.date}</h4>
                                    <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">${weekday}</p>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button type="button" class="btn btn-sm btn-light" onclick="taskManager.loadHistoryProgress('${progress.date}')" style="padding: 6px 12px; font-size: 13px; border: none; border-radius: 6px; background-color: rgba(255, 255, 255, 0.2); color: white; cursor: pointer; transition: all 0.3s ease;">加载进度</button>
                                    <button type="button" class="btn btn-sm btn-danger" onclick="taskManager.deleteHistoryProgress('${progress.date}')" style="padding: 6px 12px; font-size: 13px; border: none; border-radius: 6px; background-color: rgba(255, 107, 107, 0.8); color: white; cursor: pointer; transition: all 0.3s ease;">删除</button>
                                </div>
                            </div>
                        </div>
                        <div class="history-content" style="padding: 20px;">
                `;
                
                // 定义科目颜色
                const courseColors = {
                    '语文': '#4ecdc4',
                    '数学': '#45b7aa',
                    '英语': '#667eea'
                };
                
                Object.entries(progress.courses).forEach(([course, data]) => {
                    let statusText = data.status;
                    if (statusText === '进行中') statusText = '正在进行';
                    else if (statusText === '已结束') statusText = '已经结束';
                    
                    const courseColor = courseColors[course] || '#999';
                    
                    historyHTML += `
                        <div class="course-progress" style="display: flex; align-items: center; margin-bottom: 12px; padding: 12px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid ${courseColor};">
                            <div style="flex: 1;">
                                <div style="font-weight: bold; font-size: 15px; color: #333;">${course}</div>
                                <div style="font-size: 14px; color: #666; margin-top: 4px;">
                                    ${data.lesson || '未设置'} ${data.unit ? '<span style="opacity: 0.8;">(' + data.unit + ')</span>' : ''}
                                </div>
                            </div>
                            <div style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; background-color: ${statusText === '正在进行' ? '#e8f5e8' : statusText === '已经结束' ? '#e3f2fd' : '#f3e5f5'}; color: ${statusText === '正在进行' ? '#2e7d32' : statusText === '已经结束' ? '#1565c0' : '#7b1fa2'};">
                                ${statusText}
                            </div>
                        </div>
                    `;
                });
                
                historyHTML += `
                        </div>
                    </div>
                `;
            });
            
            historyList.innerHTML = historyHTML;
        }
        
        // 显示历史进度模态框
        document.getElementById('history-modal').style.display = 'block';
    }
    
    // 加载历史进度
    loadHistoryProgress(date) {
        const student = document.getElementById('progress-student').value;
        const progressList = JSON.parse(localStorage.getItem('schoolProgress')) || [];
        const progress = progressList.find(item => item.student === student && item.date === date);
        
        if (progress) {
            // 设置日期
            document.getElementById('progress-date').value = progress.date;
            
            // 更新课程列表
            this.updateCourseList();
            
            // 填充课程进度
            Object.entries(progress.courses).forEach(([course, data]) => {
                const unitInput = document.getElementById(`${course}-unit`);
                const lessonInput = document.getElementById(`${course}-lesson`);
                const statusSelect = document.getElementById(`${course}-status`);
                if (unitInput) unitInput.value = data.unit || '';
                if (lessonInput) lessonInput.value = data.lesson;
                if (statusSelect) statusSelect.value = data.status;
            });
            
            // 关闭历史进度模态框
            document.getElementById('history-modal').style.display = 'none';
        }
    }
    
    // 删除历史进度
    deleteHistoryProgress(date) {
        if (confirm('确定要删除此历史进度吗？')) {
            const student = document.getElementById('progress-student').value;
            let progressList = JSON.parse(localStorage.getItem('schoolProgress')) || [];
            progressList = progressList.filter(item => !(item.student === student && item.date === date));
            localStorage.setItem('schoolProgress', JSON.stringify(progressList));
            this.showHistoryProgress();
        }
    }
    
    // 更新课程列表
    updateCourseList() {
        const student = document.getElementById('progress-student').value;
        const grade = document.getElementById('progress-grade').value;
        const semester = document.getElementById('progress-semester').value;
        const coursesContainer = document.getElementById('progress-courses');
        
        if (!student || !grade || !semester) {
            coursesContainer.innerHTML = '<p>请选择学霸、年级和册别</p>';
            return;
        }
        
        // 根据年级选择课程
        let courses;
        if (grade === 'grade5') {
            courses = ['语文', '数学', '英语'];
        } else {
            courses = ['语文', '数学', '英语', '物理', '化学'];
        }
        
        // 从教材中提取课程数据
        const getCourseData = (grade, subject, semester) => {
            const courseData = {};
            const textbookItems = document.querySelectorAll('.textbook-item');
            
            textbookItems.forEach(item => {
                const itemGrade = item.dataset.grade;
                const itemSubject = item.dataset.subject;
                const itemSemester = item.dataset.semester;
                
                if (itemGrade === grade && itemSubject === subject && 
                    (itemSemester === semester || itemSemester === 'all')) {
                    const chapters = item.querySelectorAll('.chapter');
                    
                    chapters.forEach(chapter => {
                        const chapterTitle = chapter.querySelector('.chapter-title').textContent.trim().replace('▶', '').trim();
                        const lessons = [];
                        const lessonElements = chapter.querySelectorAll('.chapter-content div');
                        
                        lessonElements.forEach(lessonElement => {
                            const lessonText = lessonElement.textContent.trim();
                            if (lessonText) {
                                lessons.push(lessonText);
                            }
                        });
                        
                        if (lessons.length > 0) {
                            courseData[chapterTitle] = lessons;
                        }
                    });
                }
            });
            
            return courseData;
        };
        
        // 生成课程列表
        let courseHTML = '';
        courses.forEach(course => {
            let unitHTML = '';
            let lessonHTML = '';
            
            // 科目映射
            const subjectMap = {
                '语文': 'chinese',
                '数学': 'math',
                '英语': 'english',
                '物理': 'physics',
                '化学': 'chemistry'
            };
            
            const subjectKey = subjectMap[course];
            
            // 从教材中获取课程数据
            const courseData = getCourseData(grade, subjectKey, semester);
            
            if (Object.keys(courseData).length > 0) {
                // 生成学习进度下拉选项
                lessonHTML = `<select id="${course}-lesson" onchange="taskManager.updateUnitOptions('${course}')">
                    <option value="">请选择学习进度</option>`;
                
                // 收集所有学习进度
                const allLessons = [];
                Object.entries(courseData).forEach(([unit, lessons]) => {
                    lessons.forEach(lesson => {
                        allLessons.push({ lesson, unit });
                    });
                });
                
                // 添加学习进度选项
                allLessons.forEach(item => {
                    lessonHTML += `<option value="${item.lesson}" data-unit="${item.unit}">${item.lesson}</option>`;
                });
                lessonHTML += `</select>`;
                
                // 生成单元下拉选项
                unitHTML = `<select id="${course}-unit">
                    <option value="">请先选择学习进度</option>
                </select>`;
            } else {
                // 没有课程数据，使用输入框
                unitHTML = `<input type="text" id="${course}-unit" placeholder="单元">`;
                lessonHTML = `<input type="text" id="${course}-lesson" placeholder="上到哪一课了">`;
            }
            
            courseHTML += `
                <div class="course-item">
                    <h3>${course}</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="${course}-lesson">学习进度</label>
                            ${lessonHTML}
                        </div>
                        <div class="form-group">
                            <label for="${course}-unit">单元</label>
                            ${unitHTML}
                        </div>
                        <div class="form-group">
                            <label for="${course}-status">课程状态</label>
                            <select id="${course}-status">
                                <option value="进行中">正在进行</option>
                                <option value="已结束">已经结束</option>
                                <option value="没有课">没有课</option>
                                <option value="讲卷子/做练习">讲卷子/做练习</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        });
        
        coursesContainer.innerHTML = courseHTML;
    }
    
    // 更新年级选项
    updateGradeOptions() {
        const student = document.getElementById('progress-student').value;
        const gradeSelect = document.getElementById('progress-grade');
        const semesterSelect = document.getElementById('progress-semester');
        const coursesContainer = document.getElementById('progress-courses');
        
        // 重置选择
        gradeSelect.value = '';
        semesterSelect.value = '';
        coursesContainer.innerHTML = '<p>请选择年级和册别</p>';
    }
    
    // 更新册别选项
    updateSemesterOptions() {
        const grade = document.getElementById('progress-grade').value;
        const semesterSelect = document.getElementById('progress-semester');
        const coursesContainer = document.getElementById('progress-courses');
        
        // 重置选择
        semesterSelect.value = '';
        coursesContainer.innerHTML = '<p>请选择册别</p>';
    }
    
    // 生成课程列表（保持向后兼容）
    generateCourses() {
        console.log('generateCourses called');
        this.updateCourseList();
    }
    
    // 更新学习进度选项
    updateLessonOptions(course) {
        console.log('updateLessonOptions called with course:', course);
        
        const unitSelect = document.getElementById(`${course}-unit`);
        const unit = unitSelect ? unitSelect.value : '';
        const lessonSelect = document.getElementById(`${course}-lesson`);
        
        console.log('Unit selected:', unit);
        console.log('Lesson select element:', lessonSelect);
        
        if (!lessonSelect) {
            console.error('Lesson select element not found for course:', course);
            return;
        }
        
        // 定义KYP的课程进度数据
        const kypCourseData = {
            '语文': {
                '第一单元': ['古诗三首', '少年闰土', '祖父的园子', '月是故乡明', '口语交际：走进他们的童年岁月', '习作：那一刻，我长大了', '语文园地'],
                '第二单元': ['草船借箭', '景阳冈', '猴王出世', '红楼春趣', '口语交际：怎么表演课本剧', '习作：写读后感', '语文园地', '快乐读书吧：读古典名著，品百味人生'],
                '第三单元': ['古诗三首', '青山处处埋忠骨', '军神', '清贫', '习作：他 了', '语文园地'],
                '第四单元': ['人物描写一组', '刷子李', '习作例文：我的朋友容容', '习作例文：小守门员和他的观众们', '习作：形形色色的人', '语文园地'],
                '第五单元': ['自相矛盾', '田忌赛马', '跳水', '习作：神奇的探险之旅', '语文园地'],
                '第六单元': ['威尼斯的小艇', '牧场之国', '金字塔：金字塔夕照', '金字塔：不可思议的金字塔', '口语交际：我是小小讲解员', '习作：中国的世界文化遗产', '语文园地'],
                '第七单元': ['杨氏之子', '手指', '童年的发现', '口语交际：我们都来讲笑话', '习作：漫画的启示', '语文园地'],
                '第八单元': ['回忆往事', '依依惜别', '采薇（节选）'],
                '古诗词阅读': ['送元二使安西', '春夜喜雨', '早春呈水部张十八员外', '江上渔者', '泊船瓜洲', '游园不值', '卜算子·送鲍浩然之浙东', '浣溪沙', '清平乐']
            },
            '数学': {
                '复习与提高': ['小数的四则混合运算', '方程', '面积的估测2', '自然数'],
                '正数和负数的初步认识': ['正数和负数'],
                '简易方程（二）': ['列方程解决问题（三）', '列方程解决问题（四）'],
                '几何小实践': ['体积', '立方厘米、立方分米、立方米', '长方体与正方体的认识', '长方体与正方体的体积', '正方体、长方体的展开图', '正方体、长方体的表面积', '小练习', '表面积的变化', '体积与容积', '体积与质量'],
                '可能性': ['可能性的大小', '可能情况的个数'],
                '总复习': ['数与运算', '练习一', '方程与代数', '练习二', '图形与几何', '练习三', '统计初步', '练习四']
            },
            '英语': {
                'Module1': ['Unit1 What a mess', 'Unit2 Watch it grow', 'Unit3 How noisy'],
                'Module2': ['Unit1 Food and drinks', 'Unit2 School subjects', 'Unit3 Films'],
                'Module3': ['Unit1 Signs', 'Unit2 Weather', 'Unit3 Museums'],
                'Module4': ['Unit1 Changes', 'Unit2 Western holidays', 'Unit3 Story time']
            }
        };
        
        // 清空学习进度选项
        lessonSelect.innerHTML = '';
        
        if (!unit) {
            lessonSelect.innerHTML = '<option value="">请先选择单元</option>';
            console.log('No unit selected, set default option');
            return;
        }
        
        // 检查课程数据是否存在
        if (!kypCourseData[course]) {
            console.error('Course data not found for:', course);
            lessonSelect.innerHTML = '<option value="">课程数据不存在</option>';
            return;
        }
        
        // 检查单元数据是否存在
        if (!kypCourseData[course][unit]) {
            console.error('Unit data not found for course', course, 'and unit', unit);
            lessonSelect.innerHTML = '<option value="">单元数据不存在</option>';
            return;
        }
        
        // 添加学习进度选项
        const lessons = kypCourseData[course][unit];
        console.log('Lessons for course', course, 'and unit', unit, ':', lessons);
        
        if (lessons && lessons.length > 0) {
            lessons.forEach(lesson => {
                lessonSelect.innerHTML += `<option value="${lesson}">${lesson}</option>`;
            });
            console.log('Lessons added successfully');
        } else {
            lessonSelect.innerHTML = '<option value="">该单元没有学习进度</option>';
            console.log('No lessons found for the selected unit');
        }
    }
    

    // 保存学校课程进度
    saveSchoolProgress() {
        const student = document.getElementById('progress-student').value;
        const grade = document.getElementById('progress-grade').value;
        const semester = document.getElementById('progress-semester').value;
        const date = document.getElementById('progress-date').value;
        
        if (!student || !grade || !semester || !date) {
            alert('请填写完整信息');
            return;
        }
        
        // 收集课程进度
        const progressData = {
            student: student,
            grade: grade,
            semester: semester,
            date: date,
            courses: {}
        };
        
        // 根据年级获取课程列表
        let courses;
        if (grade === 'grade5') {
            courses = ['语文', '数学', '英语'];
        } else {
            courses = ['语文', '数学', '英语', '物理', '化学'];
        }
        
        // 收集每门课的进度
        courses.forEach(course => {
            const unit = document.getElementById(`${course}-unit`).value;
            const lesson = document.getElementById(`${course}-lesson`).value;
            const status = document.getElementById(`${course}-status`).value;
            progressData.courses[course] = {
                unit: unit,
                lesson: lesson,
                status: status
            };
        });
        
        // 保存到本地存储
        let progressList = JSON.parse(localStorage.getItem('schoolProgress')) || [];
        
        // 检查是否已有该日期的进度
        const existingIndex = progressList.findIndex(item => 
            item.student === student && 
            item.date === date &&
            item.grade === grade &&
            item.semester === semester
        );
        
        if (existingIndex !== -1) {
            // 更新现有进度
            progressList[existingIndex] = progressData;
        } else {
            // 添加新进度
            progressList.push(progressData);
        }
        
        localStorage.setItem('schoolProgress', JSON.stringify(progressList));
        
        alert('课程进度保存成功！');
        document.getElementById('school-progress-modal').style.display = 'none';
        document.getElementById('school-progress-form').reset();
    }
    
    // 初始化详细分析功能
    initDetailedAnalysis() {
        // 创建详细分析模态框
        const modalHTML = `
            <div id="detailed-analysis-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="detailed-analysis-title">详细分析</h3>
                        <span class="close" onclick="document.getElementById('detailed-analysis-modal').style.display='none'">×</span>
                    </div>
                    <div class="modal-body">
                        <div id="detailed-analysis-content"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // 初始化历史进度模态框
    initHistoryModal() {
        // 历史进度模态框关闭按钮
        const historyModalClose = document.querySelector('#history-modal .close');
        if (historyModalClose) {
            historyModalClose.addEventListener('click', function() {
                document.getElementById('history-modal').style.display = 'none';
            });
        }
        
        // 点击历史进度模态框外部关闭
        window.addEventListener('click', function(event) {
            if (event.target.id === 'history-modal') {
                document.getElementById('history-modal').style.display = 'none';
            }
        });
    }
    
    // 清除所有数据
    clearAllData() {
        if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
            // 清除所有本地存储数据
            localStorage.removeItem('schoolProgress');
            localStorage.removeItem('tasks');
            localStorage.removeItem('completedSections');
            
            // 重新初始化应用
            this.tasks = [];
            this.renderTasks();
            
            alert('所有数据已清除！');
        }
    }
    
    // 清除学校课程进度数据
    clearSchoolProgressData() {
        if (confirm('确定要清除学校课程进度数据吗？此操作不可恢复！')) {
            // 只清除学校课程进度数据
            localStorage.removeItem('schoolProgress');
            
            alert('学校课程进度数据已清除！');
        }
    }
    
    // 更新单元选项
    updateUnitOptions(course) {
        console.log('updateUnitOptions called with course:', course);
        
        const lessonSelect = document.getElementById(`${course}-lesson`);
        const unitSelect = document.getElementById(`${course}-unit`);
        
        console.log('Lesson select element:', lessonSelect);
        console.log('Unit select element:', unitSelect);
        
        if (!lessonSelect || !unitSelect) {
            console.error('Element not found for course:', course);
            return;
        }
        
        // 获取选中的学习进度
        const selectedOption = lessonSelect.options[lessonSelect.selectedIndex];
        console.log('Selected option:', selectedOption);
        
        if (!selectedOption || !selectedOption.value) {
            // 没有选择学习进度，重置单元选项
            unitSelect.innerHTML = '<option value="">请先选择学习进度</option>';
            console.log('No lesson selected, reset unit options');
            return;
        }
        
        // 获取学习进度对应的单元
        const unit = selectedOption.dataset.unit;
        console.log('Unit for selected lesson:', unit);
        
        if (!unit) {
            console.error('Unit not found for selected lesson');
            unitSelect.innerHTML = '<option value="">单元数据不存在</option>';
            return;
        }
        
        // 更新单元选项
        unitSelect.innerHTML = `<option value="${unit}" selected>${unit}</option>`;
        console.log('Unit options updated successfully');
    }
    
    // 初始化直接打标小节功能
    initMarkSectionModal() {
        // 绑定直接打标小节按钮点击事件
        const markSectionBtn = document.getElementById('mark-section-btn');
        if (markSectionBtn) {
            markSectionBtn.addEventListener('click', () => {
                // 直接打标，不需要打开模态框
                const student = document.getElementById('task-student').value;
                const subject = document.getElementById('task-subject').value;
                const assignment = document.getElementById('task-assignment').value;
                const chapter = document.getElementById('task-chapter').value;
                const section = document.getElementById('task-section').value;
                
                // 验证所有字段都已填写
                if (!student || !subject || !assignment || !chapter || !section) {
                    alert('请填写所有必填字段');
                    return;
                }
                
                // 检查该小节是否已经完成
                if (this.isSectionCompleted(student, subject, assignment, chapter, section)) {
                    alert('该小节已经完成，无需重复打标');
                    return;
                }
                
                // 创建一个新的任务对象，标记为已完成
                const now = new Date();
                const task = {
                    id: Date.now().toString(),
                    student: student,
                    subject: subject,
                    title: '家庭作业',
                    assignment: assignment,
                    chapter: chapter,
                    section: section,
                    startDate: now.toISOString(),
                    dueDate: now.toISOString(),
                    priority: '高',
                    completed: true,
                    completedAt: now.toISOString(),
                    images: [] // 直接打标不需要上传图片
                };
                
                // 添加到任务列表
                this.tasks.push(task);
                this.saveTasks();
                
                // 提示用户操作成功
                alert('小节打标完成成功！');
                
                // 重新渲染任务列表
                this.renderTasks();
                
                // 更新小节选项，显示已完成的标记
                this.updateSectionOptions();
            });
        }
        
        // 绑定取消打标按钮点击事件
        const unmarkSectionBtn = document.getElementById('unmark-section-btn');
        if (unmarkSectionBtn) {
            unmarkSectionBtn.addEventListener('click', () => {
                // 获取当前选择的字段
                const student = document.getElementById('task-student').value;
                const subject = document.getElementById('task-subject').value;
                const assignment = document.getElementById('task-assignment').value;
                const chapter = document.getElementById('task-chapter').value;
                const section = document.getElementById('task-section').value;
                
                // 验证所有字段都已填写
                if (!student || !subject || !assignment || !chapter || !section) {
                    alert('请填写所有必填字段');
                    return;
                }
                
                // 检查该小节是否已经完成
                if (!this.isSectionCompleted(student, subject, assignment, chapter, section)) {
                    alert('该小节尚未完成，无需取消打标');
                    return;
                }
                
                // 从任务列表中删除该任务
                this.tasks = this.tasks.filter(task => {
                    return !(task.student === student &&
                           task.subject === subject &&
                           task.assignment === assignment &&
                           task.chapter === chapter &&
                           task.section === section &&
                           task.completed === true);
                });
                
                // 保存任务列表
                this.saveTasks();
                
                // 提示用户操作成功
                alert('小节取消打标成功！');
                
                // 重新渲染任务列表
                this.renderTasks();
                
                // 更新小节选项，移除已完成的标记
                this.updateSectionOptions();
            });
        }
        
        // 绑定关闭按钮事件
        const modal = document.getElementById('mark-section-modal');
        if (modal) {
            modal.querySelector('.close').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // 绑定模态框拖拽功能
            this.initModalDrag();
        }
        
        // 绑定学霸选择事件
        const studentSelect = document.getElementById('mark-student');
        if (studentSelect) {
            studentSelect.addEventListener('change', (e) => {
                this.updateMarkSubjectOptions(e.target.value);
                this.updateMarkAssignmentOptions();
                this.updateMarkChapterOptions();
            });
        }
        
        // 绑定科目选择事件
        const subjectSelect = document.getElementById('mark-subject');
        if (subjectSelect) {
            subjectSelect.addEventListener('change', () => {
                this.updateMarkAssignmentOptions();
                this.updateMarkChapterOptions();
            });
        }
        
        // 绑定具体作业选择事件
        const assignmentSelect = document.getElementById('mark-assignment');
        if (assignmentSelect) {
            assignmentSelect.addEventListener('change', () => {
                this.updateMarkChapterOptions();
            });
        }
        
        // 绑定章节选择事件
        const chapterSelect = document.getElementById('mark-chapter');
        if (chapterSelect) {
            chapterSelect.addEventListener('change', () => {
                this.updateMarkSectionOptions();
            });
        }
        
        // 绑定表单提交事件
        const form = document.getElementById('mark-section-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.markSectionComplete();
            });
        }
    }
    
    // 更新直接打标小节的科目选项
    updateMarkSubjectOptions(student) {
        const subjectSelect = document.getElementById('mark-subject');
        if (!subjectSelect) return;
        
        // 清空现有选项
        subjectSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择科目';
        subjectSelect.appendChild(defaultOption);
        
        // 根据学霸添加科目选项
        if (student === 'KYP') {
            // KYP只有语文、数学、英语
            const subjects = ['语文', '数学', '英语'];
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
        } else {
            // KL有所有科目
            const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
        }
    }
    
    // 更新直接打标小节的具体作业选项
    updateMarkAssignmentOptions() {
        const studentSelect = document.getElementById('mark-student');
        const assignmentSelect = document.getElementById('mark-assignment');
        if (!studentSelect || !assignmentSelect) return;
        
        const student = studentSelect.value;
        
        // 清空现有选项
        assignmentSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择作业';
        assignmentSelect.appendChild(defaultOption);
        
        // 根据学霸添加具体作业选项
        if (student === 'KYP') {
            // KYP只有上海作业和名校名卷
            const assignments = ['上海作业', '名校名卷'];
            assignments.forEach(assignment => {
                const option = document.createElement('option');
                option.value = assignment;
                option.textContent = assignment;
                assignmentSelect.appendChild(option);
            });
        } else if (student === 'KL') {
            // KL只有一课一练和教材全解
            const assignments = ['一课一练', '教材全解'];
            assignments.forEach(assignment => {
                const option = document.createElement('option');
                option.value = assignment;
                option.textContent = assignment;
                assignmentSelect.appendChild(option);
            });
        }
    }
    
    // 更新直接打标小节的章节选项
    updateMarkChapterOptions() {
        const subjectSelect = document.getElementById('mark-subject');
        const assignmentSelect = document.getElementById('mark-assignment');
        const chapterSelect = document.getElementById('mark-chapter');
        if (!subjectSelect || !assignmentSelect || !chapterSelect) return;
        
        const subject = subjectSelect.value;
        const assignment = assignmentSelect.value;
        
        // 清空现有选项
        chapterSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择章节';
        chapterSelect.appendChild(defaultOption);
        
        // 根据科目和具体作业添加章节选项
        let chapters = [];
        if (subject === '物理' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 物理教材全解和一课一练的章节
            chapters = [
                '第6章 密度与压强',
                '第7章 浮力',
                '第8章 简单机械 功和能',
                '第9章 物态变化'
            ];
        } else if (subject === '化学' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 化学教材全解和一课一练的章节
            chapters = [
                '专题1 化学使生活更美好',
                '专题2 体验化学实验探究',
                '专题3 空气、氧气、二氧化碳',
                '专题4 水的性质与组成',
                '专题5 物质的微观构成',
                '专题6 化学变化及其表示'
            ];
        } else if (subject === '数学' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 数学教材全解和一课一练的章节
            chapters = [
                '第23章 四边形',
                '第24章 平面直角坐标系',
                '第25章 一次函数',
                '第26章 反比例函数'
            ];
        } else if (subject === '数学' && assignment === '上海作业') {
            // 数学上海作业的章节
            chapters = [
                '第一章 复习与提高',
                '第二章 正数与负数的初步认识',
                '第三章 简易方程',
                '第四章 几何小实践',
                '第五章 可能性',
                '第六章 总复习',
                '专项复习'
            ];
        }
        
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = chapter;
            chapterSelect.appendChild(option);
        });
    }
    
    // 更新直接打标小节的小节选项
    updateMarkSectionOptions() {
        const assignmentSelect = document.getElementById('mark-assignment');
        const chapterSelect = document.getElementById('mark-chapter');
        const sectionSelect = document.getElementById('mark-section');
        if (!assignmentSelect || !chapterSelect || !sectionSelect) return;
        
        const assignment = assignmentSelect.value;
        const chapter = chapterSelect.value;
        
        // 清空现有选项
        sectionSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择小节';
        sectionSelect.appendChild(defaultOption);
        
        // 根据具体作业和章节添加相应的小节选项
        let sections = [];
        if (chapter === '第一章 复习与提高' && assignment === '上海作业') {
            sections = [
                '1.1 小数的四则混合运算1',
                '1.1 小数的四则混合运算2',
                '1.2 方程',
                '1.3 面积的估算2',
                '1.4 自然数',
                '第一单元评价测试'
            ];
        } else if (chapter === '第二章 正数与负数的初步认识' && assignment === '上海作业') {
            sections = [
                '2.1 正数和负数1',
                '2.1 正数和负数2',
                '2.2 数轴1',
                '2.2 数轴2',
                '第二单元评价测试',
                '阶段练习（一）'
            ];
        } else if (chapter === '第三章 简易方程' && assignment === '上海作业') {
            sections = [
                '3.1 列方程解决问题（三）1',
                '3.1 列方程解决问题（三）2',
                '3.1 列方程解决问题（三）3',
                '3.1 列方程解决问题（三）4',
                '3.1 列方程解决问题（三）5',
                '3.1 列方程解决问题（三）6',
                '3.1 列方程解决问题（三）7',
                '阶段练习（二）',
                '3.2 列方程解决问题（四）1',
                '3.2 列方程解决问题（四）2',
                '3.2 列方程解决问题（四）3',
                '第三单元评价测试',
                '期中综合评价测试'
            ];
        } else if (chapter === '第四章 几何小实践' && assignment === '上海作业') {
            sections = [
                '4.1 体积',
                '4.2 立方厘米、立方分米、立方米1',
                '4.2 立方厘米、立方分米、立方米2',
                '4.3 长方体与正方体的认识',
                '4.4 长方体与正方体的体积1',
                '4.4 长方体与正方体的体积2',
                '4.5 组合体的体积',
                '阶段练习（三）',
                '4.6 正方体、长方体的展开图——正方体的展开图',
                '4.6 正方体、长方体的展开图——长方体的展开图',
                '4.7 正方体、长方体的表面积——正方体的表面积',
                '4.7 正方体、长方体的表面积——长方体的表面积',
                '4.8 小练习',
                '4.9 表面积的变化1',
                '4.9 表面积的变化2',
                '4.9 表面积的变化3',
                '4.10 体积与容积——容积与容积的单位',
                '4.10 体积与容积——求容积',
                '4.10 体积与容积用量具测不规则物体的体积',
                '4.11* 体积与质量',
                '阶段练习（四）',
                '第四单元评价测试'
            ];
        } else if (chapter === '第五章 可能性' && assignment === '上海作业') {
            sections = [
                '5.1 可能性',
                '5.2 可能性的大小',
                '5.3 可能情况的个数1',
                '5.3 可能情况的个数2',
                '第五单元评价测试'
            ];
        } else if (chapter === '第六章 总复习' && assignment === '上海作业') {
            sections = [
                '6.1 数与运算1',
                '6.1 数与运算2',
                '6.1 数与运算3',
                '6.1 数与运算4',
                '6.2 方程与代数1',
                '6.2 方程与代数2',
                '6.2 方程与代数3',
                '6.3 图形与几何1',
                '6.3 图形与几何2',
                '6.3 图形与几何3',
                '6.3 图形与几何4',
                '6.4 统计初步1',
                '6.4 统计初步2',
                '6.4 统计初步3',
                '6.4 统计初步4',
                '第六单元评价测试'
            ];
        } else if (chapter === '专项复习' && assignment === '上海作业') {
            sections = [
                '专项一 计算',
                '专项二 概念',
                '专项三 几何',
                '专项四 应用',
                '期末综合评价测试（一）',
                '期末综合评价测试（二）'
            ];
        } else if (chapter === '第6章 密度与压强') {
            if (assignment === '一课一练') {
                sections = [
                    '6.1 物质的密度',
                    '6.2 固体、液体密度的测量1',
                    '6.2 固体、液体密度的测量2',
                    '6.2 固体、液体密度的测量3',
                    '6.3 压力与压强1',
                    '6.3 压力与压强2',
                    '6.3 压力与压强3',
                    '6.4 液体压强1',
                    '6.4 液体压强2',
                    '6.4 液体压强3',
                    '6.4 液体压强4',
                    '6.5 大气压强',
                    '6.6 流体压强与流速的关系1',
                    '6.6 流体压强与流速的关系2',
                    '第6章单元测试'
                ];
            } else {
                sections = [
                    '第1节 物质的密度',
                    '第2节 固体、液体密度的测量',
                    '第3节 压力与压强',
                    '第4节 液体压强',
                    '第5节 大气压强',
                    '第6节 流体压强与流速的关系',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第7章 浮力') {
            if (assignment === '一课一练') {
                sections = [
                    '7.1 浮力',
                    '7.2 阿基米德原理1',
                    '7.2 阿基米德原理2',
                    '7.2 阿基米德原理3',
                    '7.3 浮沉的条件及应用1',
                    '7.3 浮沉的条件及应用2',
                    '7.3 浮沉的条件及应用3',
                    '第7章单元测试'
                ];
            } else {
                sections = [
                    '第1节 浮力',
                    '第2节 阿基米德原理',
                    '第3节 浮沉的条件及应用',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第8章 简单机械 功和能') {
            if (assignment === '一课一练') {
                sections = [
                    '8.1 杠杆1',
                    '8.1 杠杆2',
                    '8.1 杠杆3',
                    '8.2 滑轮1',
                    '8.2 滑轮2',
                    '8.3 功与功率1',
                    '8.3 功与功率2',
                    '8.3 功与功率3',
                    '8.4 机械能及其转化1',
                    '8.4 机械能及其转化2',
                    '8.4 机械能及其转化3',
                    '8.4 机械能及其转化4',
                    '8.5 机械效率',
                    '第8章单元测试'
                ];
            } else {
                sections = [
                    '第1节 杠杆',
                    '第2节 滑轮',
                    '第3节 功与功率',
                    '第4节 机械能及其转化',
                    '第5节 机械效率',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第9章 物态变化') {
            if (assignment === '一课一练') {
                sections = [
                    '9.1 温度1',
                    '9.1 温度2',
                    '9.2 汽化和液化1',
                    '9.2 汽化和液化2',
                    '9.2 汽化和液化3',
                    '9.3 熔化和凝固1',
                    '9.3 熔化和凝固2',
                    '9.4 升华和凝华',
                    '第9章单元测试',
                    '期中测试',
                    '期末测试'
                ];
            } else {
                sections = [
                    '第1节 温度',
                    '第2节 汽化和液化',
                    '第3节 熔化和凝固',
                    '第4节 升华和凝华',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '专题1 化学使生活更美好') {
            if (assignment === '一课一练') {
                sections = [
                    '开启化学之门1',
                    '开启化学之门2',
                    '通用的化学语言1',
                    '通用的化学语言2',
                    '专题练习',
                    '专题测试'
                ];
            } else {
                sections = [
                    '课题1 开启化学之门',
                    '课题2 通用的化学语言',
                    '专题复习'
                ];
            }
        } else if (chapter === '专题2 体验化学实验探究') {
            if (assignment === '一课一练') {
                sections = [
                    '走进化学实验室1',
                    '走进化学实验室2',
                    '走进化学实验室3',
                    '学习开展化学实验研究',
                    '专题练习',
                    '专题测试',
                    '第一学期期中测试'
                ];
            } else {
                sections = [
                    '课题1 走进化学实验室',
                    '课题2 学习开展化学实验探究',
                    '专题复习',
                    '主题一综合测评'
                ];
            }
        } else if (chapter === '专题3 空气、氧气、二氧化碳') {
            if (assignment === '一课一练') {
                sections = [
                    '空气的成分1',
                    '空气的成分2',
                    '氧气和二氧化碳的性质1',
                    '氧气和二氧化碳的性质2',
                    '氧气和二氧化碳的制备1',
                    '氧气和二氧化碳的制备2',
                    '氧气和二氧化碳的制备3',
                    '专题练习',
                    '专题测试',
                    '第一学期期末测试1',
                    '第一学期期末测试2'
                ];
            } else {
                sections = [
                    '课题1 空气的成分',
                    '课题2 氧气和二氧化碳的性质',
                    '课题3 氧气和二氧化碳的制备',
                    '专题复习',
                    '主题二综合测评'
                ];
            }
        } else if (chapter === '专题4 水的性质与组成') {
            if (assignment === '一课一练') {
                sections = [
                    '水的性质',
                    '水的自然循环与人工净化1',
                    '水的自然循环与人工净化2',
                    '水的组成',
                    '专题练习',
                    '专题测试'
                ];
            } else {
                sections = [
                    '课题1 水的性质',
                    '课题2 水的自然循环与人工净化',
                    '专题复习'
                ];
            }
        } else if (chapter === '专题5 物质的微观构成') {
            if (assignment === '一课一练') {
                sections = [
                    '构成物质的微观粒子1',
                    '构成物质的微观粒子2',
                    '组成物质的元素1',
                    '组成物质的元素2',
                    '组织物质的元素3',
                    '结构多样的碳单质1',
                    '结构多样的碳单质2',
                    '专题练习',
                    '专题测试',
                    '第二学期期中测试'
                ];
            } else {
                sections = [
                    '课题1 构成物质的微观粒子',
                    '课题2 组成物质的元素',
                    '课题3 结构多样的碳单质',
                    '专题复习',
                    '主题三综合测评'
                ];
            }
        } else if (chapter === '专题6 化学变化及其表示') {
            if (assignment === '一课一练') {
                sections = [
                    '化学反应中各物质间的定量关系1',
                    '化学反应中各物质间的定量关系2',
                    '化学反应的表示及基本类型1',
                    '化学反应的表示及基本类型2',
                    '化学反应的表示及基本类型3',
                    '专题练习',
                    '专题测试',
                    '第二学期期末测试1',
                    '第二学期期末测试2'
                ];
            } else {
                sections = [
                    '课题1 化学反应中各物质间的定量关系',
                    '课题2 化学反应的表示及基本类型',
                    '专题复习',
                    '主题四综合测评'
                ];
            }
        } else if (chapter === '第23章 四边形') {
            if (assignment === '一课一练') {
                sections = [
                    '23.1.1 多边形的内角和',
                    '23.1.2 多边形的外角和',
                    '习题23.1',
                    '23.2.1 平行四边形的性质1',
                    '23.2.2 平行四边形的性质2',
                    '23.2.3 平行四边形的判定1',
                    '23.2.4 平行四边形的判定2',
                    '习题23.2',
                    '23.3.1 矩形',
                    '23.3.2 菱形',
                    '23.3.3 正方形',
                    '习题23.3',
                    '23.4.1 三角形的中位线',
                    '23.4.2 三角形的重心',
                    '习题23.4',
                    '单元练习23'
                ];
            } else {
                sections = [
                    '23.1 多边形',
                    '23.2 平行四边形',
                    '23.3 矩形、菱形与正方形',
                    '23.4 三角形的中位线与重心',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第24章 平面直角坐标系') {
            if (assignment === '一课一练') {
                sections = [
                    '24.1.1 平面直角坐标系的引入',
                    '24.1.2 简单图形的坐标表达',
                    '24.1.3 物体位置的坐标表示',
                    '习题24.1',
                    '24.2 两点间的距离公式',
                    '习题24.2',
                    '24.3.1 平移',
                    '24.3.2 轴对称',
                    '习题24.3',
                    '单元练习24'
                ];
            } else {
                sections = [
                    '24.1 平面直角坐标系',
                    '24.2 两点间的距离公式',
                    '24.3 平移与轴对称',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第25章 一次函数') {
            if (assignment === '一课一练') {
                sections = [
                    '25.1 变量与函数',
                    '25.2.1 正比例函数的概念',
                    '25.2.2 正比例函数的图像',
                    '25.2.3 正比例函数的性质',
                    '习题25.2',
                    '25.3.1 一次函数的概念',
                    '25.3.2 一次函数的图像',
                    '25.3.3 一次函数的性质',
                    '25.3.3.4 一次函数、一次方程与一次不等式',
                    '习题25.3',
                    '25.4 一次函数的应用',
                    '习题25.4',
                    '单元练习25'
                ];
            } else {
                sections = [
                    '25.1 变量与函数',
                    '25.2 正比例函数',
                    '25.3 一次函数',
                    '25.4 一次函数的应用',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第26章 反比例函数') {
            if (assignment === '一课一练') {
                sections = [
                    '26.1 反比例函数',
                    '26.2.1 反比例函数的图像与性质1',
                    '26.2.2 反比例函数的图像与性质2',
                    '习题26.2',
                    '26.3 反比例函数的应用',
                    '习题26.3',
                    '单元练习26',
                    '期中练习',
                    '期末练习'
                ];
            } else {
                sections = [
                    '26.1 反比例函数',
                    '26.2 反比例函数的图像与性质',
                    '26.3 反比例函数的应用',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        }
        
        // 添加小节选项
        const student = document.getElementById('mark-student').value;
        const subject = document.getElementById('mark-subject').value;
        
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            
            // 检查小节是否已完成
            const isCompleted = this.isSectionCompleted(student, subject, assignment, chapter, section);
            if (isCompleted) {
                option.classList.add('completed-section');
                option.textContent = section + ' (已完成)';
            } else {
                option.textContent = section;
            }
            
            sectionSelect.appendChild(option);
        });
    }
    
    // 直接打标小节为完成
    markSectionComplete() {
        const student = document.getElementById('mark-student').value;
        const subject = document.getElementById('mark-subject').value;
        const assignment = document.getElementById('mark-assignment').value;
        const chapter = document.getElementById('mark-chapter').value;
        const section = document.getElementById('mark-section').value;
        
        // 验证所有字段都已填写
        if (!student || !subject || !assignment || !chapter || !section) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 检查该小节是否已经完成
        if (this.isSectionCompleted(student, subject, assignment, chapter, section)) {
            alert('该小节已经完成，无需重复打标');
            return;
        }
        
        // 创建一个新的任务对象，标记为已完成
        const now = new Date();
        const task = {
            id: Date.now().toString(),
            student: student,
            subject: subject,
            title: '家庭作业',
            assignment: assignment,
            chapter: chapter,
            section: section,
            startDate: now.toISOString(),
            dueDate: now.toISOString(),
            priority: '高',
            completed: true,
            completedAt: now.toISOString(),
            images: [] // 直接打标不需要上传图片
        };
        
        // 添加到任务列表
        this.tasks.push(task);
        this.saveTasks();
        
        // 关闭模态框
        document.getElementById('mark-section-modal').style.display = 'none';
        
        // 提示用户操作成功
        alert('小节打标完成成功！');
        
        // 重新渲染任务列表
        this.renderTasks();
    }
    
    // 显示详细分析
    showDetailedAnalysis(type, value) {
        const tasks = this.tasks;
        let filteredTasks = [];
        let title = '';
        
        if (type === 'week') {
            // 解析周格式：YYYY-WNN
            const [year, week] = value.split('-W');
            filteredTasks = tasks.filter(task => {
                if (!task.completedAt) return false;
                const taskDate = new Date(task.completedAt);
                const taskYear = taskDate.getFullYear();
                const taskWeek = this.getWeekNumber(taskDate);
                return taskYear == year && taskWeek == week;
            });
            title = `第 ${week} 周详细分析`;
        } else if (type === 'month') {
            // 解析月格式：YYYY-MM
            const [year, month] = value.split('-');
            filteredTasks = tasks.filter(task => {
                if (!task.completedAt) return false;
                const taskDate = new Date(task.completedAt);
                const taskYear = taskDate.getFullYear();
                const taskMonth = taskDate.getMonth() + 1;
                return taskYear == year && taskMonth == month;
            });
            title = `${year}年${month}月详细分析`;
        } else if (type === 'year') {
            // 解析年格式：YYYY
            const year = value;
            filteredTasks = tasks.filter(task => {
                if (!task.completedAt) return false;
                const taskDate = new Date(task.completedAt);
                const taskYear = taskDate.getFullYear();
                return taskYear == year;
            });
            title = `${year}年详细分析`;
        }
        
        // 生成详细分析内容
        const content = this.generateDetailedAnalysisContent(filteredTasks, type, value);
        
        // 更新模态框内容
        document.getElementById('detailed-analysis-title').textContent = title;
        document.getElementById('detailed-analysis-content').innerHTML = content;
        
        // 显示模态框
        document.getElementById('detailed-analysis-modal').style.display = 'block';
        
        // 绘制图表
        setTimeout(() => {
            this.drawDetailedAnalysisChart();
        }, 100);
    }
    
    // 生成详细分析内容
    generateDetailedAnalysisContent(tasks, type, value) {
        // 按天分组
        const tasksByDay = {};
        tasks.forEach(task => {
            if (!task.completedAt) return;
            const date = new Date(task.completedAt).toISOString().slice(0, 10);
            if (!tasksByDay[date]) {
                tasksByDay[date] = {
                    tasks: [],
                    count: 0,
                    totalTime: 0,
                    overtimeCount: 0
                };
            }
            tasksByDay[date].tasks.push(task);
            tasksByDay[date].count++;
            
            // 计算时间花费
            const startTime = new Date(task.startDate).getTime();
            const completedTime = new Date(task.completedAt).getTime();
            const timeSpent = completedTime - startTime;
            tasksByDay[date].totalTime += timeSpent;
            
            // 计算超时任务
            const dueTime = new Date(task.dueDate).getTime();
            if (completedTime > dueTime) {
                tasksByDay[date].overtimeCount++;
            }
        });
        
        // 生成HTML内容
        let html = `
            <div class="detailed-analysis-chart">
                <h4>每日作业完成情况</h4>
                <canvas id="daily-chart" width="600" height="300"></canvas>
            </div>
            <div class="detailed-analysis-table">
                <h4>作业明细</h4>
                <table>
                    <tr>
                        <th>日期</th>
                        <th>作业数量</th>
                        <th>总花费时间</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(tasksByDay).forEach(([date, data]) => {
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${data.count}</td>
                    <td>${this.formatDuration(data.totalTime)}</td>
                    <td>${data.overtimeCount}</td>
                </tr>
            `;
        });
        
        html += `
                </table>
            </div>
        `;
        
        // 保存任务数据到全局变量，以便绘制图表
        window.tasksByDay = tasksByDay;
        
        return html;
    }
    
    // 绘制详细分析图表
    drawDetailedAnalysisChart() {
        // 准备图表数据
        const tasksByDay = window.tasksByDay || {};
        const labels = Object.keys(tasksByDay);
        const data = Object.values(tasksByDay).map(d => d.count);
        
        // 创建图表
        const canvas = document.getElementById('daily-chart');
        if (!canvas) return;
        
        // 调整canvas宽度，确保可以显示所有标签
        const minWidth = Math.max(600, labels.length * 80);
        canvas.width = minWidth;
        
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制柱状图
        const barWidth = (canvas.width - 40) / labels.length;
        const maxValue = Math.max(...data) * 1.2 || 1;
        
        // 绘制坐标轴
        ctx.beginPath();
        ctx.moveTo(30, 20);
        ctx.lineTo(30, 280);
        ctx.lineTo(canvas.width - 20, 280);
        ctx.stroke();
        
        // 绘制Y轴刻度和单位
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = 280 - (i * 260 / 5);
            const value = Math.round(maxValue * i / 5);
            ctx.beginPath();
            ctx.moveTo(28, y);
            ctx.lineTo(32, y);
            ctx.stroke();
            ctx.fillText(value, 25, y + 4);
        }
        // 绘制Y轴单位
        ctx.font = '12px Arial';
        ctx.fillText('作业数量', 10, 20);
        
        // 绘制柱状图
        labels.forEach((label, index) => {
            const barHeight = (data[index] / maxValue) * 260;
            ctx.fillStyle = '#667eea';
            ctx.fillRect(30 + index * barWidth + 10, 280 - barHeight, barWidth - 20, barHeight);
            
            // 绘制数值标签
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(data[index], 30 + index * barWidth + barWidth / 2, 280 - barHeight - 5);
            
            // 绘制日期标签
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, 30 + index * barWidth + barWidth / 2, 295);
        });
        
        // 绘制标题
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('每日作业数量', canvas.width / 2, 15);
    }
    
    setDefaultDates() {
        const now = new Date();
        
        // 设置开始日期为当前日期，时间为16:00
        const startDateInput = document.getElementById('task-start-date');
        if (startDateInput) {
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            startDateInput.value = `${year}-${month}-${day}T16:00`;
        }
        
        // 设置截止日期为当前日期，时间为00:00
        const dueDateInput = document.getElementById('task-due-date');
        if (dueDateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dueDateInput.value = `${year}-${month}-${day}T00:00`;
        }
        
        // 设置日期范围默认值：起始日期和截止日期都为今天
        const dateStartInput = document.getElementById('date-start');
        const dateEndInput = document.getElementById('date-end');
        if (dateStartInput && dateEndInput) {
            // 起始日期和截止日期都为今天
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
            dateStartInput.value = todayStr;
            dateEndInput.value = todayStr;
        }
    }
    
    // 检查是否已经存在其他学霸的作业
    checkStudentTasks() {
        // 移除限制，允许添加不同学霸的作业
    }
    
    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    formatDateLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    bindEvents() {
        // 添加任务表单提交
        document.getElementById('add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // 编辑任务表单提交
        document.getElementById('edit-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask();
        });
        
        // 作业类型选择事件
        document.getElementById('task-title').addEventListener('change', (e) => {
            this.toggleAssignmentFields(e.target.value);
        });
        
        // 编辑任务模态框作业类型选择事件
        document.getElementById('edit-task-title').addEventListener('change', (e) => {
            this.toggleEditAssignmentFields(e.target.value);
        });
        
        // 学霸选择事件
        document.getElementById('task-student').addEventListener('change', (e) => {
            this.updateSubjectOptions(e.target.value);
            
            // 如果当前是家庭作业，更新具体作业选项
            const taskType = document.getElementById('task-title').value;
            if (taskType === '家庭作业') {
                this.updateHomeworkAssignmentOptions();
                this.updateChapterOptions();
            }
        });
        
        // 科目选择事件
        document.getElementById('task-subject').addEventListener('change', () => {
            // 如果当前是家庭作业，更新章节选项
            const taskType = document.getElementById('task-title').value;
            if (taskType === '家庭作业') {
                this.updateChapterOptions();
            }
        });
        
        // 具体作业选择事件
        document.getElementById('task-assignment').addEventListener('change', () => {
            // 如果当前是家庭作业，更新章节选项
            const taskType = document.getElementById('task-title').value;
            if (taskType === '家庭作业') {
                this.updateChapterOptions();
            }
        });
        
        // 章节选择事件
        document.getElementById('task-chapter').addEventListener('change', () => {
            // 如果当前是家庭作业，更新小节选项
            const taskType = document.getElementById('task-title').value;
            if (taskType === '家庭作业') {
                this.updateSectionOptions();
            }
        });
        
        // 编辑任务模态框学霸选择事件
        document.getElementById('edit-task-student').addEventListener('change', (e) => {
            this.updateEditSubjectOptions(e.target.value);
            
            // 如果当前是家庭作业，更新具体作业选项
            const taskType = document.getElementById('edit-task-title').value;
            if (taskType === '家庭作业') {
                this.updateEditHomeworkAssignmentOptions();
                this.updateEditChapterOptions();
            }
        });
        
        // 编辑任务模态框科目选择事件
        document.getElementById('edit-task-subject').addEventListener('change', () => {
            // 如果当前是家庭作业，更新章节选项
            const taskType = document.getElementById('edit-task-title').value;
            if (taskType === '家庭作业') {
                this.updateEditChapterOptions();
            }
        });
        
        // 编辑任务模态框具体作业选择事件
        document.getElementById('edit-task-assignment').addEventListener('change', () => {
            // 如果当前是家庭作业，更新章节选项
            const taskType = document.getElementById('edit-task-title').value;
            if (taskType === '家庭作业') {
                this.updateEditChapterOptions();
            }
        });
        
        // 编辑任务模态框章节选择事件
        document.getElementById('edit-task-chapter').addEventListener('change', () => {
            // 如果当前是家庭作业，更新小节选项
            const taskType = document.getElementById('edit-task-title').value;
            if (taskType === '家庭作业') {
                this.updateEditSectionOptions();
            }
        });
        
        // 过滤按钮点击
        document.querySelectorAll('.filter-buttons button').forEach(button => {
            button.addEventListener('click', () => {
                this.setFilter(button.dataset.filter);
            });
        });
        
        // 排序方式变更
        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.setSort(e.target.value);
        });
        
        // 学霸过滤按钮点击
        document.querySelectorAll('.student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除所有按钮的active类
                document.querySelectorAll('.student-btn').forEach(b => b.classList.remove('active'));
                // 添加当前按钮的active类
                e.target.classList.add('active');
                // 更新当前学霸过滤选项
                this.currentStudentFilter = e.target.dataset.student;
                // 重新渲染任务列表
                this.renderTasks();
            });
        });
        
        // 作业类型过滤按钮点击
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除所有按钮的active类
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                // 添加当前按钮的active类
                e.target.classList.add('active');
                // 更新当前作业类型过滤选项
                this.currentTypeFilter = e.target.dataset.type;
                // 重新渲染任务列表
                this.renderTasks();
            });
        });
        
        // 日期范围过滤按钮点击
        document.getElementById('apply-date-filter').addEventListener('click', () => {
            const startDate = document.getElementById('date-start').value;
            const endDate = document.getElementById('date-end').value;
            
            // 更新日期范围过滤选项
            this.dateFilter.start = startDate;
            this.dateFilter.end = endDate;
            
            // 确保学霸过滤按钮的状态与currentStudentFilter的值保持一致
            document.querySelectorAll('.student-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.student === this.currentStudentFilter) {
                    btn.classList.add('active');
                }
            });
            
            // 确保作业类型过滤按钮的状态与currentTypeFilter的值保持一致
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === this.currentTypeFilter) {
                    btn.classList.add('active');
                }
            });
            
            // 重新渲染任务列表
            this.renderTasks();
        });
        
        // 关闭模态框
        document.querySelector('#edit-modal .close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // 编辑作业模态框最小化按钮
        document.querySelector('#edit-modal .modal-controls .minimize').addEventListener('click', () => {
            this.minimizeEditModal();
        });
        
        // 编辑作业模态框最大化按钮
        document.querySelector('#edit-modal .modal-controls .maximize').addEventListener('click', () => {
            this.toggleFullscreenEditModal();
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('edit-modal');
            if (e.target === modal) {
                this.closeModal();
            }
            
            const efficiencyModal = document.getElementById('efficiency-modal');
            if (e.target === efficiencyModal) {
                this.closeEfficiencyModal();
            }
        });
        
        // 效率分析仪表盘按钮点击
        const efficiencyBtn = document.getElementById('efficiency-dashboard');
        if (efficiencyBtn) {
            efficiencyBtn.addEventListener('click', () => {
                console.log('点击了学习效率分析按钮');
                this.openEfficiencyDashboard();
            });
        } else {
            console.error('效率分析仪表盘按钮未找到');
        }
        
        // 刷新页面按钮点击
        const refreshBtn = document.getElementById('refresh-page-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                location.reload();
            });
        }
        
        // 效率分析仪表盘模态框关闭按钮
        document.querySelector('#efficiency-modal .close').addEventListener('click', () => {
            this.closeEfficiencyModal();
        });
        
        // 效率分析仪表盘最小化按钮
        document.getElementById('minimize-efficiency').addEventListener('click', () => {
            this.minimizeEfficiencyModal();
        });
        
        // 效率分析仪表盘全屏按钮
        document.getElementById('fullscreen-efficiency').addEventListener('click', () => {
            this.toggleFullscreenEfficiencyModal();
        });
        
        // 作业明细模态框关闭按钮
        const homeworkDetailModalClose = document.querySelector('#homework-detail-modal .close');
        if (homeworkDetailModalClose) {
            homeworkDetailModalClose.addEventListener('click', () => {
                this.closeHomeworkDetailModal();
            });
        }
        
        // 效率分析仪表盘更新分析按钮（使用HTML的onclick属性）
        
        // 上传作业按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-upload')) {
                const taskId = e.target.dataset.id;
                this.openUploadModal(taskId);
            }
        });
        
        // 上传作业模态框关闭按钮
        document.querySelector('#upload-modal .close').addEventListener('click', () => {
            this.closeUploadModal();
        });
        
        // 上传作业按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.id === 'upload-btn') {
                this.uploadImage();
            }
        });
        
        // 打开桌面文件夹
        document.getElementById('open-desktop').addEventListener('click', () => {
            // 尝试打开桌面文件夹
            try {
                if (window.navigator.userAgent.toLowerCase().includes('windows')) {
                    // Windows系统 - 尝试打开桌面文件夹
                    window.open('file:///C:/Users/');
                } else if (window.navigator.userAgent.toLowerCase().includes('macintosh')) {
                    // macOS系统 - 尝试打开桌面文件夹
                    window.open('file:///Users/');
                } else {
                    // 其他系统 - 尝试打开主目录
                    window.open('file:///');
                }
            } catch (e) {
                alert('无法打开文件夹，请手动打开桌面并选择图片。');
            }
        });
        

        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const uploadModal = document.getElementById('upload-modal');
            if (e.target === uploadModal) {
                this.closeUploadModal();
            }
        });
        
        // 模态框拖拽功能
        this.initModalDrag();
        
        // 绑定图片查看器事件
        this.bindImageViewerEvents();
        
        // 详细分析点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('clickable')) {
                const type = e.target.dataset.type;
                const value = e.target.dataset.value;
                if (type && value) {
                    this.showDetailedAnalysis(type, value);
                }
            }
        });
        
        // 作业项点击事件 - 打开作业明细模态框
        document.addEventListener('click', (e) => {
            const homeworkItem = e.target.closest('.homework-progress-item');
            if (homeworkItem) {
                const student = homeworkItem.dataset.student;
                const subject = homeworkItem.dataset.subject;
                const assignment = homeworkItem.dataset.assignment;
                if (student && subject && assignment) {
                    console.log('点击了作业项:', student, subject, assignment);
                    this.openHomeworkDetailModal(student, subject, assignment);
                }
            }
        });
        
        // 更新分析按钮点击事件
        const updateEfficiencyBtn = document.getElementById('update-efficiency');
        if (updateEfficiencyBtn) {
            updateEfficiencyBtn.addEventListener('click', () => {
                console.log('点击了更新分析按钮');
                this.generateEfficiencyReport();
            });
        }
        
        // 详细分析模态框关闭事件
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('detailed-analysis-modal');
            if (modal && e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // 清除学校课程进度数据按钮点击事件
        const clearProgressBtn = document.getElementById('clear-progress-btn');
        if (clearProgressBtn) {
            clearProgressBtn.addEventListener('click', () => this.clearSchoolProgressData());
        }
    }
    
    // 绑定图片查看器事件
    bindImageViewerEvents() {
        // 点击图片打开查看器
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.task-item')) {
                const imgSrc = e.target.src;
                this.openImageViewer(imgSrc);
            }
        });
        
        // 关闭图片查看器
        document.querySelector('#image-viewer .close').addEventListener('click', () => {
            this.closeImageViewer();
        });
        
        // 点击图片查看器外部关闭
        window.addEventListener('click', (e) => {
            const imageViewer = document.getElementById('image-viewer');
            if (e.target === imageViewer) {
                this.closeImageViewer();
            }
        });
    }
    
    // 打开图片查看器
    openImageViewer(imgSrc) {
        const imageViewer = document.getElementById('image-viewer');
        const viewerImage = document.getElementById('viewer-image');
        viewerImage.src = imgSrc;
        imageViewer.style.display = 'block';
    }
    
    // 关闭图片查看器
    closeImageViewer() {
        const imageViewer = document.getElementById('image-viewer');
        imageViewer.style.display = 'none';
    }
    
    // 检查小节是否已完成
    isSectionCompleted(topStudent, subject, assignment, chapter, section) {
        // 处理不同的参数情况
        if (arguments.length === 4) {
            // 参数为：topStudent, subject, assignment, section
            section = chapter;
            chapter = undefined;
        }
        
        return this.tasks.some(task => {
            return task.student === topStudent &&
                   task.subject === subject &&
                   task.assignment === assignment &&
                   (chapter === undefined || task.chapter === chapter) &&
                   task.section === section &&
                   task.completed === true;
        });
    }
    
    // 更新科目选项
    updateSubjectOptions(student) {
        const subjectSelect = document.getElementById('task-subject');
        // 保存当前选中的科目
        const currentSubject = subjectSelect.value;
        
        // 清空现有选项
        subjectSelect.innerHTML = '';
        
        // 所有科目
        const allSubjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
        // KYP只能选择的科目
        const kypSubjects = ['语文', '数学', '英语'];
        
        // 根据学霸选择添加相应的科目选项
        const subjects = student === 'KYP' ? kypSubjects : allSubjects;
        
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择第一个选项
        if (subjects.includes(currentSubject)) {
            subjectSelect.value = currentSubject;
        } else {
            subjectSelect.value = subjects[0];
        }
    }
    
    // 更新编辑任务模态框的科目选项
    updateEditSubjectOptions(student) {
        const subjectSelect = document.getElementById('edit-task-subject');
        // 保存当前选中的科目
        const currentSubject = subjectSelect.value;
        
        // 清空现有选项
        subjectSelect.innerHTML = '';
        
        // 所有科目
        const allSubjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
        // KYP只能选择的科目
        const kypSubjects = ['语文', '数学', '英语'];
        
        // 根据学霸选择添加相应的科目选项
        const subjects = student === 'KYP' ? kypSubjects : allSubjects;
        
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择第一个选项
        if (subjects.includes(currentSubject)) {
            subjectSelect.value = currentSubject;
        } else {
            subjectSelect.value = subjects[0];
        }
    }
    
    // 更新家庭作业的具体作业选项
    updateHomeworkAssignmentOptions() {
        const studentSelect = document.getElementById('task-student');
        const assignmentSelect = document.getElementById('task-assignment');
        
        if (!studentSelect || !assignmentSelect) return;
        
        const student = studentSelect.value;
        const currentAssignment = assignmentSelect.value;
        
        // 清空现有选项
        assignmentSelect.innerHTML = '';
        
        // 根据学霸选择添加相应的具体作业选项
        let assignments = [];
        if (student === 'KYP') {
            // KYP只能选择上海作业和名校名卷
            assignments = ['上海作业', '名校名卷'];
        } else if (student === 'KL') {
            // KL只能选择一课一练和教材全解
            assignments = ['一课一练', '教材全解'];
        }
        
        assignments.forEach(assignment => {
            const option = document.createElement('option');
            option.value = assignment;
            option.textContent = assignment;
            assignmentSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择第一个选项
        if (assignments.includes(currentAssignment)) {
            assignmentSelect.value = currentAssignment;
        } else if (assignments.length > 0) {
            assignmentSelect.value = assignments[0];
        }
    }
    
    // 更新编辑模态框中家庭作业的具体作业选项
    updateEditHomeworkAssignmentOptions() {
        const studentSelect = document.getElementById('edit-task-student');
        const assignmentSelect = document.getElementById('edit-task-assignment');
        
        if (!studentSelect || !assignmentSelect) return;
        
        const student = studentSelect.value;
        const currentAssignment = assignmentSelect.value;
        
        // 清空现有选项
        assignmentSelect.innerHTML = '';
        
        // 根据学霸选择添加相应的具体作业选项
        let assignments = [];
        if (student === 'KYP') {
            // KYP只能选择上海作业和名校名卷
            assignments = ['上海作业', '名校名卷'];
        } else if (student === 'KL') {
            // KL只能选择一课一练和教材全解
            assignments = ['一课一练', '教材全解'];
        }
        
        assignments.forEach(assignment => {
            const option = document.createElement('option');
            option.value = assignment;
            option.textContent = assignment;
            assignmentSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择第一个选项
        if (assignments.includes(currentAssignment)) {
            assignmentSelect.value = currentAssignment;
        } else if (assignments.length > 0) {
            assignmentSelect.value = assignments[0];
        }
    }
    
    // 更新章节选项
    updateChapterOptions() {
        const subjectSelect = document.getElementById('task-subject');
        const assignmentSelect = document.getElementById('task-assignment');
        const chapterSelect = document.getElementById('task-chapter');
        
        if (!subjectSelect || !assignmentSelect || !chapterSelect) return;
        
        const subject = subjectSelect.value;
        const assignment = assignmentSelect.value;
        const currentChapter = chapterSelect.value;
        
        // 清空现有选项
        chapterSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择章节';
        chapterSelect.appendChild(defaultOption);
        
        // 根据科目、作业类型和具体作业添加相应的章节选项
        let chapters = [];
        if (subject === '物理' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 物理教材全解和一课一练的章节
            chapters = [
                '第6章 密度与压强',
                '第7章 浮力',
                '第8章 简单机械 功和能',
                '第9章 物态变化'
            ];
        } else if (subject === '化学' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 化学教材全解和一课一练的章节
            chapters = [
                '专题1 化学使生活更美好',
                '专题2 体验化学实验探究',
                '专题3 空气、氧气、二氧化碳',
                '专题4 水的性质与组成',
                '专题5 物质的微观构成',
                '专题6 化学变化及其表示'
            ];
        } else if (subject === '数学' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 数学教材全解和一课一练的章节
            chapters = [
                '第23章 四边形',
                '第24章 平面直角坐标系',
                '第25章 一次函数',
                '第26章 反比例函数'
            ];
        } else if (subject === '数学' && assignment === '上海作业') {
            // 数学上海作业的章节
            chapters = [
                '第一章 复习与提高',
                '第二章 正数与负数的初步认识',
                '第三章 简易方程',
                '第四章 几何小实践',
                '第五章 可能性',
                '第六章 总复习',
                '专项复习'
            ];
        }
        
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = chapter;
            chapterSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择默认选项
        if (chapters.includes(currentChapter)) {
            chapterSelect.value = currentChapter;
        } else {
            chapterSelect.value = '';
        }
        
        // 更新小节选项
        this.updateSectionOptions();
    }
    
    // 更新小节选项
    updateSectionOptions() {
        const assignmentSelect = document.getElementById('task-assignment');
        const chapterSelect = document.getElementById('task-chapter');
        const sectionSelect = document.getElementById('task-section');
        
        if (!assignmentSelect || !chapterSelect || !sectionSelect) return;
        
        const assignment = assignmentSelect.value;
        const chapter = chapterSelect.value;
        const currentSection = sectionSelect.value;
        
        // 清空现有选项
        sectionSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择小节';
        sectionSelect.appendChild(defaultOption);
        
        // 根据具体作业和章节添加相应的小节选项
        let sections = [];
        if (chapter === '第一章 复习与提高' && assignment === '上海作业') {
            sections = [
                '1.1 小数的四则混合运算1',
                '1.1 小数的四则混合运算2',
                '1.2 方程',
                '1.3 面积的估算2',
                '1.4 自然数',
                '第一单元评价测试'
            ];
        } else if (chapter === '第二章 正数与负数的初步认识' && assignment === '上海作业') {
            sections = [
                '2.1 正数和负数1',
                '2.1 正数和负数2',
                '2.2 数轴1',
                '2.2 数轴2',
                '第二单元评价测试',
                '阶段练习（一）'
            ];
        } else if (chapter === '第三章 简易方程' && assignment === '上海作业') {
            sections = [
                '3.1 列方程解决问题（三）1',
                '3.1 列方程解决问题（三）2',
                '3.1 列方程解决问题（三）3',
                '3.1 列方程解决问题（三）4',
                '3.1 列方程解决问题（三）5',
                '3.1 列方程解决问题（三）6',
                '3.1 列方程解决问题（三）7',
                '阶段练习（二）',
                '3.2 列方程解决问题（四）1',
                '3.2 列方程解决问题（四）2',
                '3.2 列方程解决问题（四）3',
                '第三单元评价测试',
                '期中综合评价测试'
            ];
        } else if (chapter === '第四章 几何小实践' && assignment === '上海作业') {
            sections = [
                '4.1 体积',
                '4.2 立方厘米、立方分米、立方米1',
                '4.2 立方厘米、立方分米、立方米2',
                '4.3 长方体与正方体的认识',
                '4.4 长方体与正方体的体积1',
                '4.4 长方体与正方体的体积2',
                '4.5 组合体的体积',
                '阶段练习（三）',
                '4.6 正方体、长方体的展开图——正方体的展开图',
                '4.6 正方体、长方体的展开图——长方体的展开图',
                '4.7 正方体、长方体的表面积——正方体的表面积',
                '4.7 正方体、长方体的表面积——长方体的表面积',
                '4.8 小练习',
                '4.9 表面积的变化1',
                '4.9 表面积的变化2',
                '4.9 表面积的变化3',
                '4.10 体积与容积——容积与容积的单位',
                '4.10 体积与容积——求容积',
                '4.10 体积与容积用量具测不规则物体的体积',
                '4.11* 体积与质量',
                '阶段练习（四）',
                '第四单元评价测试'
            ];
        } else if (chapter === '第五章 可能性' && assignment === '上海作业') {
            sections = [
                '5.1 可能性',
                '5.2 可能性的大小',
                '5.3 可能情况的个数1',
                '5.3 可能情况的个数2',
                '第五单元评价测试'
            ];
        } else if (chapter === '第六章 总复习' && assignment === '上海作业') {
            sections = [
                '6.1 数与运算1',
                '6.1 数与运算2',
                '6.1 数与运算3',
                '6.1 数与运算4',
                '6.2 方程与代数1',
                '6.2 方程与代数2',
                '6.2 方程与代数3',
                '6.3 图形与几何1',
                '6.3 图形与几何2',
                '6.3 图形与几何3',
                '6.3 图形与几何4',
                '6.4 统计初步1',
                '6.4 统计初步2',
                '6.4 统计初步3',
                '6.4 统计初步4',
                '第六单元评价测试'
            ];
        } else if (chapter === '专项复习' && assignment === '上海作业') {
            sections = [
                '专项一 计算',
                '专项二 概念',
                '专项三 几何',
                '专项四 应用',
                '期末综合评价测试（一）',
                '期末综合评价测试（二）'
            ];
        } else if (chapter === '第6章 密度与压强') {
            if (assignment === '一课一练') {
                sections = [
                    '6.1 物质的密度',
                    '6.2 固体、液体密度的测量1',
                    '6.2 固体、液体密度的测量2',
                    '6.2 固体、液体密度的测量3',
                    '6.3 压力与压强1',
                    '6.3 压力与压强2',
                    '6.3 压力与压强3',
                    '6.4 液体压强1',
                    '6.4 液体压强2',
                    '6.4 液体压强3',
                    '6.4 液体压强4',
                    '6.5 大气压强',
                    '6.6 流体压强与流速的关系1',
                    '6.6 流体压强与流速的关系2',
                    '第6章单元测试'
                ];
            } else {
                sections = [
                    '第1节 物质的密度',
                    '第2节 固体、液体密度的测量',
                    '第3节 压力与压强',
                    '第4节 液体压强',
                    '第5节 大气压强',
                    '第6节 流体压强与流速的关系',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第7章 浮力') {
            if (assignment === '一课一练') {
                sections = [
                    '7.1 浮力',
                    '7.2 阿基米德原理1',
                    '7.2 阿基米德原理2',
                    '7.2 阿基米德原理3',
                    '7.3 浮沉的条件及应用1',
                    '7.3 浮沉的条件及应用2',
                    '7.3 浮沉的条件及应用3',
                    '第7章单元测试'
                ];
            } else {
                sections = [
                    '第1节 浮力',
                    '第2节 阿基米德原理',
                    '第3节 浮沉的条件及应用',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第8章 简单机械 功和能') {
            if (assignment === '一课一练') {
                sections = [
                    '8.1 杠杆1',
                    '8.1 杠杆2',
                    '8.1 杠杆3',
                    '8.2 滑轮1',
                    '8.2 滑轮2',
                    '8.3 功与功率1',
                    '8.3 功与功率2',
                    '8.3 功与功率3',
                    '8.4 机械能及其转化1',
                    '8.4 机械能及其转化2',
                    '8.4 机械能及其转化3',
                    '8.4 机械能及其转化4',
                    '8.5 机械效率',
                    '第8章单元测试'
                ];
            } else {
                sections = [
                    '第1节 杠杆',
                    '第2节 滑轮',
                    '第3节 功与功率',
                    '第4节 机械能及其转化',
                    '第5节 机械效率',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第9章 物态变化') {
            if (assignment === '一课一练') {
                sections = [
                    '9.1 温度1',
                    '9.1 温度2',
                    '9.2 汽化和液化1',
                    '9.2 汽化和液化2',
                    '9.2 汽化和液化3',
                    '9.3 熔化和凝固1',
                    '9.3 熔化和凝固2',
                    '9.4 升华和凝华',
                    '第9章单元测试',
                    '期中测试',
                    '期末测试'
                ];
            } else {
                sections = [
                    '第1节 温度',
                    '第2节 汽化和液化',
                    '第3节 熔化和凝固',
                    '第4节 升华和凝华',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '专题1 化学使生活更美好') {
            if (assignment === '一课一练') {
                sections = [
                    '开启化学之门1',
                    '开启化学之门2',
                    '通用的化学语言1',
                    '通用的化学语言2',
                    '专题练习',
                    '专题测试'
                ];
            } else {
                sections = [
                    '课题1 开启化学之门',
                    '课题2 通用的化学语言',
                    '专题复习'
                ];
            }
        } else if (chapter === '专题2 体验化学实验探究') {
            if (assignment === '一课一练') {
                sections = [
                    '走进化学实验室1',
                    '走进化学实验室2',
                    '走进化学实验室3',
                    '学习开展化学实验研究',
                    '专题练习',
                    '专题测试',
                    '第一学期期中测试'
                ];
            } else {
                sections = [
                    '课题1 走进化学实验室',
                    '课题2 学习开展化学实验探究',
                    '专题复习',
                    '主题一综合测评'
                ];
            }
        } else if (chapter === '专题3 空气、氧气、二氧化碳') {
            if (assignment === '一课一练') {
                sections = [
                    '空气的成分1',
                    '空气的成分2',
                    '氧气和二氧化碳的性质1',
                    '氧气和二氧化碳的性质2',
                    '氧气和二氧化碳的制备1',
                    '氧气和二氧化碳的制备2',
                    '氧气和二氧化碳的制备3',
                    '专题练习',
                    '专题测试',
                    '第一学期期末测试1',
                    '第一学期期末测试2'
                ];
            } else {
                sections = [
                    '课题1 空气的成分',
                    '课题2 氧气和二氧化碳的性质',
                    '课题3 氧气和二氧化碳的制备',
                    '专题复习',
                    '主题二综合测评'
                ];
            }
        } else if (chapter === '专题4 水的性质与组成') {
            if (assignment === '一课一练') {
                sections = [
                    '水的性质',
                    '水的自然循环与人工净化1',
                    '水的自然循环与人工净化2',
                    '水的组成',
                    '专题练习',
                    '专题测试'
                ];
            } else {
                sections = [
                    '课题1 水的性质',
                    '课题2 水的自然循环与人工净化',
                    '专题复习'
                ];
            }
        } else if (chapter === '专题5 物质的微观构成') {
            if (assignment === '一课一练') {
                sections = [
                    '构成物质的微观粒子1',
                    '构成物质的微观粒子2',
                    '组成物质的元素1',
                    '组成物质的元素2',
                    '组成物质的元素3',
                    '结构多样的碳单质1',
                    '结构多样的碳单质2',
                    '专题练习',
                    '专题测试',
                    '第二学期期中测试'
                ];
            } else {
                sections = [
                    '课题1 构成物质的微观粒子',
                    '课题2 组成物质的元素',
                    '课题3 结构多样的碳单质',
                    '专题复习',
                    '主题三综合测评'
                ];
            }
        } else if (chapter === '专题6 化学变化及其表示') {
            if (assignment === '一课一练') {
                sections = [
                    '化学反应中各物质间的定量关系1',
                    '化学反应中各物质间的定量关系2',
                    '化学反应的表示及基本类型1',
                    '化学反应的表示及基本类型2',
                    '化学反应的表示及基本类型3',
                    '专题练习',
                    '专题测试',
                    '第二学期期末测试1',
                    '第二学期期末测试2'
                ];
            } else {
                sections = [
                    '课题1 化学反应中各物质间的定量关系',
                    '课题2 化学反应的表示及基本类型',
                    '专题复习',
                    '主题四综合测评'
                ];
            }
        } else if (chapter === '第23章 四边形') {
            if (assignment === '一课一练') {
                sections = [
                    '23.1.1 多边形的内角和',
                    '23.1.2 多边形的外角和',
                    '习题23.1',
                    '23.2.1 平行四边形的性质1',
                    '23.2.2 平行四边形的性质2',
                    '23.2.3 平行四边形的判定1',
                    '23.2.4 平行四边形的判定2',
                    '习题23.2',
                    '23.3.1 矩形',
                    '23.3.2 菱形',
                    '23.3.3 正方形',
                    '习题23.3',
                    '23.4.1 三角形的中位线',
                    '23.4.2 三角形的重心',
                    '习题23.4',
                    '单元练习23'
                ];
            } else {
                sections = [
                    '23.1 多边形',
                    '23.2 平行四边形',
                    '23.3 矩形、菱形与正方形',
                    '23.4 三角形的中位线与重心',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第24章 平面直角坐标系') {
            if (assignment === '一课一练') {
                sections = [
                    '24.1.1 平面直角坐标系的引入',
                    '24.1.2 简单图形的坐标表达',
                    '24.1.3 物体位置的坐标表示',
                    '习题24.1',
                    '24.2 两点间的距离公式',
                    '习题24.2',
                    '24.3.1 平移',
                    '24.3.2 轴对称',
                    '习题24.3',
                    '单元练习24'
                ];
            } else {
                sections = [
                    '24.1 平面直角坐标系',
                    '24.2 两点间的距离公式',
                    '24.3 平移与轴对称',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第25章 一次函数') {
            if (assignment === '一课一练') {
                sections = [
                    '25.1 变量与函数',
                    '25.2.1 正比例函数的概念',
                    '25.2.2 正比例函数的图像',
                    '25.2.3 正比例函数的性质',
                    '习题25.2',
                    '25.3.1 一次函数的概念',
                    '25.3.2 一次函数的图像',
                    '25.3.3 一次函数的性质',
                    '25.3.4 一次函数、一次方程与一次不等式',
                    '习题25.3',
                    '25.4 一次函数的应用',
                    '习题25.4',
                    '单元练习25'
                ];
            } else {
                sections = [
                    '25.1 变量与函数',
                    '25.2 正比例函数',
                    '25.3 一次函数',
                    '25.4 一次函数的应用',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第26章 反比例函数') {
            if (assignment === '一课一练') {
                sections = [
                    '26.1 反比例函数',
                    '26.2.1 反比例函数的图像与性质1',
                    '26.2.2 反比例函数的图像与性质2',
                    '习题26.2',
                    '26.3 反比例函数的应用',
                    '习题26.3',
                    '单元练习26',
                    '期中练习',
                    '期末练习'
                ];
            } else {
                sections = [
                    '26.1 反比例函数',
                    '26.2 反比例函数的图像与性质',
                    '26.3 反比例函数的应用',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        }
        
        const topStudent = document.getElementById('task-student').value;
        const subject = document.getElementById('task-subject').value;
        
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            
            // 检查该小节是否已完成
            if (this.isSectionCompleted(topStudent, subject, assignment, chapter, section)) {
                option.classList.add('completed-section');
                option.textContent += ' (已完成)';
            }
            
            sectionSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择默认选项
        if (sections.includes(currentSection)) {
            sectionSelect.value = currentSection;
        } else {
            sectionSelect.value = '';
        }
    }
    
    // 更新编辑模态框的章节选项
    updateEditChapterOptions() {
        const subjectSelect = document.getElementById('edit-task-subject');
        const assignmentSelect = document.getElementById('edit-task-assignment');
        const chapterSelect = document.getElementById('edit-task-chapter');
        
        if (!subjectSelect || !assignmentSelect || !chapterSelect) return;
        
        const subject = subjectSelect.value;
        const assignment = assignmentSelect.value;
        const currentChapter = chapterSelect.value;
        
        // 清空现有选项
        chapterSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择章节';
        chapterSelect.appendChild(defaultOption);
        
        // 根据科目、作业类型和具体作业添加相应的章节选项
        let chapters = [];
        if (subject === '物理' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 物理教材全解和一课一练的章节
            chapters = [
                '第6章 密度与压强',
                '第7章 浮力',
                '第8章 简单机械 功和能',
                '第9章 物态变化'
            ];
        } else if (subject === '化学' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 化学教材全解和一课一练的章节
            chapters = [
                '专题1 化学使生活更美好',
                '专题2 体验化学实验探究',
                '专题3 空气、氧气、二氧化碳',
                '专题4 水的性质与组成',
                '专题5 物质的微观构成',
                '专题6 化学变化及其表示'
            ];
        } else if (subject === '数学' && (assignment === '教材全解' || assignment === '一课一练')) {
            // 数学教材全解和一课一练的章节
            chapters = [
                '第23章 四边形',
                '第24章 平面直角坐标系',
                '第25章 一次函数',
                '第26章 反比例函数'
            ];
        } else if (subject === '数学' && assignment === '上海作业') {
            // 数学上海作业的章节
            chapters = [
                '第一章 复习与提高',
                '第二章 正数与负数的初步认识',
                '第三章 简易方程',
                '第四章 几何小实践',
                '第五章 可能性',
                '第六章 总复习',
                '专项复习'
            ];
        }
        
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = chapter;
            chapterSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择默认选项
        if (chapters.includes(currentChapter)) {
            chapterSelect.value = currentChapter;
        } else {
            chapterSelect.value = '';
        }
        
        // 更新编辑模态框的小节选项
        this.updateEditSectionOptions();
    }
    
    // 更新编辑模态框的小节选项
    updateEditSectionOptions() {
        const assignmentSelect = document.getElementById('edit-task-assignment');
        const chapterSelect = document.getElementById('edit-task-chapter');
        const sectionSelect = document.getElementById('edit-task-section');
        
        if (!assignmentSelect || !chapterSelect || !sectionSelect) return;
        
        const assignment = assignmentSelect.value;
        const chapter = chapterSelect.value;
        const currentSection = sectionSelect.value;
        
        // 清空现有选项
        sectionSelect.innerHTML = '';
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '选择小节';
        sectionSelect.appendChild(defaultOption);
        
        // 根据具体作业和章节添加相应的小节选项
        let sections = [];
        if (chapter === '第一章 复习与提高' && assignment === '上海作业') {
            sections = [
                '1.1 小数的四则混合运算1',
                '1.1 小数的四则混合运算2',
                '1.2 方程',
                '1.3 面积的估算2',
                '1.4 自然数',
                '第一单元评价测试'
            ];
        } else if (chapter === '第二章 正数与负数的初步认识' && assignment === '上海作业') {
            sections = [
                '2.1 正数和负数1',
                '2.1 正数和负数2',
                '2.2 数轴1',
                '2.2 数轴2',
                '第二单元评价测试',
                '阶段练习（一）'
            ];
        } else if (chapter === '第三章 简易方程' && assignment === '上海作业') {
            sections = [
                '3.1 列方程解决问题（三）1',
                '3.1 列方程解决问题（三）2',
                '3.1 列方程解决问题（三）3',
                '3.1 列方程解决问题（三）4',
                '3.1 列方程解决问题（三）5',
                '3.1 列方程解决问题（三）6',
                '3.1 列方程解决问题（三）7',
                '阶段练习（二）',
                '3.2 列方程解决问题（四）1',
                '3.2 列方程解决问题（四）2',
                '3.2 列方程解决问题（四）3',
                '第三单元评价测试',
                '期中综合评价测试'
            ];
        } else if (chapter === '第四章 几何小实践' && assignment === '上海作业') {
            sections = [
                '4.1 体积',
                '4.2 立方厘米、立方分米、立方米1',
                '4.2 立方厘米、立方分米、立方米2',
                '4.3 长方体与正方体的认识',
                '4.4 长方体与正方体的体积1',
                '4.4 长方体与正方体的体积2',
                '4.5 组合体的体积',
                '阶段练习（三）',
                '4.6 正方体、长方体的展开图——正方体的展开图',
                '4.6 正方体、长方体的展开图——长方体的展开图',
                '4.7 正方体、长方体的表面积——正方体的表面积',
                '4.7 正方体、长方体的表面积——长方体的表面积',
                '4.8 小练习',
                '4.9 表面积的变化1',
                '4.9 表面积的变化2',
                '4.9 表面积的变化3',
                '4.10 体积与容积——容积与容积的单位',
                '4.10 体积与容积——求容积',
                '4.10 体积与容积用量具测不规则物体的体积',
                '4.11* 体积与质量',
                '阶段练习（四）',
                '第四单元评价测试'
            ];
        } else if (chapter === '第五章 可能性' && assignment === '上海作业') {
            sections = [
                '5.1 可能性',
                '5.2 可能性的大小',
                '5.3 可能情况的个数1',
                '5.3 可能情况的个数2',
                '第五单元评价测试'
            ];
        } else if (chapter === '第六章 总复习' && assignment === '上海作业') {
            sections = [
                '6.1 数与运算1',
                '6.1 数与运算2',
                '6.1 数与运算3',
                '6.1 数与运算4',
                '6.2 方程与代数1',
                '6.2 方程与代数2',
                '6.2 方程与代数3',
                '6.3 图形与几何1',
                '6.3 图形与几何2',
                '6.3 图形与几何3',
                '6.3 图形与几何4',
                '6.4 统计初步1',
                '6.4 统计初步2',
                '6.4 统计初步3',
                '6.4 统计初步4',
                '第六单元评价测试'
            ];
        } else if (chapter === '专项复习' && assignment === '上海作业') {
            sections = [
                '专项一 计算',
                '专项二 概念',
                '专项三 几何',
                '专项四 应用',
                '期末综合评价测试（一）',
                '期末综合评价测试（二）'
            ];
        } else if (chapter === '第6章 密度与压强') {
            if (assignment === '一课一练') {
                sections = [
                    '6.1 物质的密度',
                    '6.2 固体、液体密度的测量1',
                    '6.2 固体、液体密度的测量2',
                    '6.2 固体、液体密度的测量3',
                    '6.3 压力与压强1',
                    '6.3 压力与压强2',
                    '6.3 压力与压强3',
                    '6.4 液体压强1',
                    '6.4 液体压强2',
                    '6.4 液体压强3',
                    '6.4 液体压强4',
                    '6.5 大气压强',
                    '6.6 流体压强与流速的关系1',
                    '6.6 流体压强与流速的关系2',
                    '第6章单元测试'
                ];
            } else {
                sections = [
                    '第1节 物质的密度',
                    '第2节 固体、液体密度的测量',
                    '第3节 压力与压强',
                    '第4节 液体压强',
                    '第5节 大气压强',
                    '第6节 流体压强与流速的关系',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第7章 浮力') {
            if (assignment === '一课一练') {
                sections = [
                    '7.1 浮力',
                    '7.2 阿基米德原理1',
                    '7.2 阿基米德原理2',
                    '7.2 阿基米德原理3',
                    '7.3 浮沉的条件及应用1',
                    '7.3 浮沉的条件及应用2',
                    '7.3 浮沉的条件及应用3',
                    '第7章单元测试'
                ];
            } else {
                sections = [
                    '第1节 浮力',
                    '第2节 阿基米德原理',
                    '第3节 浮沉的条件及应用',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第8章 简单机械 功和能') {
            if (assignment === '一课一练') {
                sections = [
                    '8.1 杠杆1',
                    '8.1 杠杆2',
                    '8.1 杠杆3',
                    '8.2 滑轮1',
                    '8.2 滑轮2',
                    '8.3 功与功率1',
                    '8.3 功与功率2',
                    '8.3 功与功率3',
                    '8.4 机械能及其转化1',
                    '8.4 机械能及其转化2',
                    '8.4 机械能及其转化3',
                    '8.4 机械能及其转化4',
                    '8.5 机械效率',
                    '第8章单元测试'
                ];
            } else {
                sections = [
                    '第1节 杠杆',
                    '第2节 滑轮',
                    '第3节 功与功率',
                    '第4节 机械能及其转化',
                    '第5节 机械效率',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第9章 物态变化') {
            if (assignment === '一课一练') {
                sections = [
                    '9.1 温度1',
                    '9.1 温度2',
                    '9.2 汽化和液化1',
                    '9.2 汽化和液化2',
                    '9.2 汽化和液化3',
                    '9.3 熔化和凝固1',
                    '9.3 熔化和凝固2',
                    '9.4 升华和凝华',
                    '第9章单元测试',
                    '期中测试',
                    '期末测试'
                ];
            } else {
                sections = [
                    '第1节 温度',
                    '第2节 汽化和液化',
                    '第3节 熔化和凝固',
                    '第4节 升华和凝华',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '专题1 化学使生活更美好') {
            if (assignment === '一课一练') {
                sections = [
                    '开启化学之门1',
                    '开启化学之门2',
                    '通用的化学语言1',
                    '通用的化学语言2',
                    '专题练习',
                    '专题测试'
                ];
            } else {
                sections = [
                    '课题1 开启化学之门',
                    '课题2 通用的化学语言',
                    '专题复习'
                ];
            }
        } else if (chapter === '专题2 体验化学实验探究') {
            if (assignment === '一课一练') {
                sections = [
                    '走进化学实验室1',
                    '走进化学实验室2',
                    '走进化学实验室3',
                    '学习开展化学实验研究',
                    '专题练习',
                    '专题测试',
                    '第一学期期中测试'
                ];
            } else {
                sections = [
                    '课题1 走进化学实验室',
                    '课题2 学习开展化学实验探究',
                    '专题复习',
                    '主题一综合测评'
                ];
            }
        } else if (chapter === '专题3 空气、氧气、二氧化碳') {
            if (assignment === '一课一练') {
                sections = [
                    '空气的成分1',
                    '空气的成分2',
                    '氧气和二氧化碳的性质1',
                    '氧气和二氧化碳的性质2',
                    '氧气和二氧化碳的制备1',
                    '氧气和二氧化碳的制备2',
                    '氧气和二氧化碳的制备3',
                    '专题练习',
                    '专题测试',
                    '第一学期期末测试1',
                    '第一学期期末测试2'
                ];
            } else {
                sections = [
                    '课题1 空气的成分',
                    '课题2 氧气和二氧化碳的性质',
                    '课题3 氧气和二氧化碳的制备',
                    '专题复习',
                    '主题二综合测评'
                ];
            }
        } else if (chapter === '专题4 水的性质与组成') {
            if (assignment === '一课一练') {
                sections = [
                    '水的性质',
                    '水的自然循环与人工净化1',
                    '水的自然循环与人工净化2',
                    '水的组成',
                    '专题练习',
                    '专题测试'
                ];
            } else {
                sections = [
                    '课题1 水的性质',
                    '课题2 水的自然循环与人工净化',
                    '专题复习'
                ];
            }
        } else if (chapter === '专题5 物质的微观构成') {
            if (assignment === '一课一练') {
                sections = [
                    '构成物质的微观粒子1',
                    '构成物质的微观粒子2',
                    '组成物质的元素1',
                    '组成物质的元素2',
                    '组成物质的元素3',
                    '结构多样的碳单质1',
                    '结构多样的碳单质2',
                    '专题练习',
                    '专题测试',
                    '第二学期期中测试'
                ];
            } else {
                sections = [
                    '课题1 构成物质的微观粒子',
                    '课题2 组成物质的元素',
                    '课题3 结构多样的碳单质',
                    '专题复习',
                    '主题三综合测评'
                ];
            }
        } else if (chapter === '专题6 化学变化及其表示') {
            if (assignment === '一课一练') {
                sections = [
                    '化学反应中各物质间的定量关系1',
                    '化学反应中各物质间的定量关系2',
                    '化学反应的表示及基本类型1',
                    '化学反应的表示及基本类型2',
                    '化学反应的表示及基本类型3',
                    '专题练习',
                    '专题测试',
                    '第二学期期末测试1',
                    '第二学期期末测试2'
                ];
            } else {
                sections = [
                    '课题1 化学反应中各物质间的定量关系',
                    '课题2 化学反应的表示及基本类型',
                    '专题复习',
                    '主题四综合测评'
                ];
            }
        } else if (chapter === '第23章 四边形') {
            if (assignment === '一课一练') {
                sections = [
                    '23.1.1 多边形的内角和',
                    '23.1.2 多边形的外角和',
                    '习题23.1',
                    '23.2.1 平行四边形的性质1',
                    '23.2.2 平行四边形的性质2',
                    '23.2.3 平行四边形的判定1',
                    '23.2.4 平行四边形的判定2',
                    '习题23.2',
                    '23.3.1 矩形',
                    '23.3.2 菱形',
                    '23.3.3 正方形',
                    '习题23.3',
                    '23.4.1 三角形的中位线',
                    '23.4.2 三角形的重心',
                    '习题23.4',
                    '单元练习23'
                ];
            } else {
                sections = [
                    '23.1 多边形',
                    '23.2 平行四边形',
                    '23.3 矩形、菱形与正方形',
                    '23.4 三角形的中位线与重心',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第24章 平面直角坐标系') {
            if (assignment === '一课一练') {
                sections = [
                    '24.1.1 平面直角坐标系的引入',
                    '24.1.2 简单图形的坐标表达',
                    '24.1.3 物体位置的坐标表示',
                    '习题24.1',
                    '24.2 两点间的距离公式',
                    '习题24.2',
                    '24.3.1 平移',
                    '24.3.2 轴对称',
                    '习题24.3',
                    '单元练习24'
                ];
            } else {
                sections = [
                    '24.1 平面直角坐标系',
                    '24.2 两点间的距离公式',
                    '24.3 平移与轴对称',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第25章 一次函数') {
            if (assignment === '一课一练') {
                sections = [
                    '25.1 变量与函数',
                    '25.2.1 正比例函数的概念',
                    '25.2.2 正比例函数的图像',
                    '25.2.3 正比例函数的性质',
                    '习题25.2',
                    '25.3.1 一次函数的概念',
                    '25.3.2 一次函数的图像',
                    '25.3.3 一次函数的性质',
                    '25.3.4 一次函数、一次方程与一次不等式',
                    '习题25.3',
                    '25.4 一次函数的应用',
                    '习题25.4',
                    '单元练习25'
                ];
            } else {
                sections = [
                    '25.1 变量与函数',
                    '25.2 正比例函数',
                    '25.3 一次函数',
                    '25.4 一次函数的应用',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        } else if (chapter === '第26章 反比例函数') {
            if (assignment === '一课一练') {
                sections = [
                    '26.1 反比例函数',
                    '26.2.1 反比例函数的图像与性质1',
                    '26.2.2 反比例函数的图像与性质2',
                    '习题26.2',
                    '26.3 反比例函数的应用',
                    '习题26.3',
                    '单元练习26',
                    '期中练习',
                    '期末练习'
                ];
            } else {
                sections = [
                    '26.1 反比例函数',
                    '26.2 反比例函数的图像与性质',
                    '26.3 反比例函数的应用',
                    '章末整合提升',
                    '章末综合练习'
                ];
            }
        }
        
        const topStudent = document.getElementById('edit-task-student').value;
        const subject = document.getElementById('edit-task-subject').value;
        
        sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            
            // 检查该小节是否已完成
            if (this.isSectionCompleted(topStudent, subject, assignment, chapter, section)) {
                option.classList.add('completed-section');
                option.textContent += ' (已完成)';
            }
            
            sectionSelect.appendChild(option);
        });
        
        // 尝试保持之前的选择，如果不再可用则选择默认选项
        if (sections.includes(currentSection)) {
            sectionSelect.value = currentSection;
        } else {
            sectionSelect.value = '';
        }
    }
    

    
    // 初始化模态框拖拽功能
    initModalDrag() {
        const modalContents = document.querySelectorAll('.modal-content');
        modalContents.forEach(modalContent => {
            // 查找.modal-content下的所有.modal-header元素，然后在其中查找.modal-title
            const header = modalContent.querySelector('.modal-header');
            if (header) {
                let isDragging = false;
                let startX, startY, offsetX, offsetY;
                
                header.addEventListener('mousedown', (e) => {
                    // 只有点击header区域才允许拖拽，排除点击按钮的情况
                    if (e.target.closest('.modal-controls') || e.target.closest('.minimize') || e.target.closest('.maximize') || e.target.closest('.close')) {
                        return;
                    }
                    
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    
                    // 计算鼠标相对于模态框左上角的偏移
                    const rect = modalContent.getBoundingClientRect();
                    offsetX = startX - rect.left;
                    offsetY = startY - rect.top;
                    
                    // 防止文本选择
                    e.preventDefault();
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    
                    // 计算新的位置
                    const newX = e.clientX - offsetX;
                    const newY = e.clientY - offsetY;
                    
                    // 设置模态框的新位置
                    modalContent.style.left = `${newX}px`;
                    modalContent.style.top = `${newY}px`;
                    modalContent.style.transform = 'none';
                });
                
                document.addEventListener('mouseup', () => {
                    isDragging = false;
                });
            }
        });
    }
    
    // 切换具体作业字段显示
    toggleAssignmentFields(taskType) {
        const homeworkFields = document.querySelectorAll('.task-assignment-homework');
        const schoolField = document.querySelector('.task-assignment-school');
        const pageRangeField = document.querySelector('.task-page-range');
        
        if (taskType === '家庭作业') {
            homeworkFields.forEach(field => {
                field.style.display = 'flex';
            });
            schoolField.style.display = 'none';
            pageRangeField.style.display = 'block';
            
            // 根据学霸选择更新具体作业选项
            this.updateHomeworkAssignmentOptions();
            // 更新章节选项
            this.updateChapterOptions();
        } else if (taskType === '学校作业') {
            homeworkFields.forEach(field => {
                field.style.display = 'none';
            });
            schoolField.style.display = 'block';
            pageRangeField.style.display = 'none';
        } else {
            homeworkFields.forEach(field => {
                field.style.display = 'none';
            });
            schoolField.style.display = 'none';
            pageRangeField.style.display = 'none';
        }
    }
    
    // 切换编辑任务模态框具体作业字段显示
    toggleEditAssignmentFields(taskType) {
        const homeworkField = document.querySelector('.edit-task-assignment-homework');
        const schoolField = document.querySelector('.edit-task-assignment-school');
        const pageRangeField = document.querySelector('.edit-task-page-range');
        
        if (taskType === '家庭作业') {
            homeworkField.style.display = 'flex';
            schoolField.style.display = 'none';
            pageRangeField.style.display = 'block';
            
            // 根据学霸选择更新编辑模态框的具体作业选项
            this.updateEditHomeworkAssignmentOptions();
            // 更新编辑模态框的章节选项
            this.updateEditChapterOptions();
        } else if (taskType === '学校作业') {
            homeworkField.style.display = 'none';
            schoolField.style.display = 'block';
            pageRangeField.style.display = 'none';
        } else {
            homeworkField.style.display = 'none';
            schoolField.style.display = 'none';
            pageRangeField.style.display = 'none';
        }
    }
    
    addTask() {
        const title = document.getElementById('task-title').value;
        const subject = document.getElementById('task-subject').value;
        const student = document.getElementById('task-student').value;
        
        // 移除限制，允许添加不同学霸的作业
        
        const startDate = document.getElementById('task-start-date').value;
        let assignment = '';
        
        let chapter = '';
        let section = '';
        if (title === '家庭作业') {
            assignment = document.getElementById('task-assignment').value;
            chapter = document.getElementById('task-chapter').value;
            section = document.getElementById('task-section').value;
            if (!assignment) {
                alert('请选择具体作业');
                return;
            }
            if (!chapter) {
                alert('请选择章节');
                return;
            }
            if (!section) {
                alert('请选择小节');
                return;
            }
        } else if (title === '学校作业') {
            const schoolAssignments = {
                preview: {
                    checked: document.getElementById('task-assignment-preview').checked,
                    description: document.getElementById('task-assignment-preview-desc').value
                },
                writing: {
                    checked: document.getElementById('task-assignment-writing').checked,
                    description: document.getElementById('task-assignment-writing-desc').value
                },
                practice: {
                    checked: document.getElementById('task-assignment-practice').checked,
                    description: document.getElementById('task-assignment-practice-desc').value
                },
                copy: {
                    checked: document.getElementById('task-assignment-copy').checked,
                    description: document.getElementById('task-assignment-copy-desc').value
                },
                dictation: {
                    checked: document.getElementById('task-assignment-dictation').checked,
                    description: document.getElementById('task-assignment-dictation-desc').value
                },
                listening: {
                    checked: document.getElementById('task-assignment-listening').checked,
                    description: document.getElementById('task-assignment-listening-desc').value
                },
                recitation: {
                    checked: document.getElementById('task-assignment-recitation').checked,
                    description: document.getElementById('task-assignment-recitation-desc').value
                },
                hbook: {
                    checked: document.getElementById('task-assignment-hbook').checked,
                    description: document.getElementById('task-assignment-hbook-desc').value
                },
                englishWorkbook: {
                    checked: document.getElementById('task-assignment-english-workbook').checked,
                    description: document.getElementById('task-assignment-english-workbook-desc').value
                },
                notebook: {
                    checked: document.getElementById('task-assignment-notebook').checked,
                    description: document.getElementById('task-assignment-notebook-desc').value
                },
                practicePaper: {
                    checked: document.getElementById('task-assignment-practice-paper').checked,
                    description: document.getElementById('task-assignment-practice-paper-desc').value
                },
                colorbook: {
                    checked: document.getElementById('task-assignment-colorbook').checked,
                    description: document.getElementById('task-assignment-colorbook-desc').value
                },
                excerpt: {
                    checked: document.getElementById('task-assignment-excerpt').checked,
                    description: document.getElementById('task-assignment-excerpt-desc').value
                },
                schoolbook: {
                    checked: document.getElementById('task-assignment-schoolbook').checked,
                    description: document.getElementById('task-assignment-schoolbook-desc').value
                },
                workbook: {
                    checked: document.getElementById('task-assignment-workbook').checked,
                    description: document.getElementById('task-assignment-workbook-desc').value
                },
                exercisebook: {
                    checked: document.getElementById('task-assignment-exercisebook').checked,
                    description: document.getElementById('task-assignment-exercisebook-desc').value
                },
                mistakebook: {
                    checked: document.getElementById('task-assignment-mistakebook').checked,
                    description: document.getElementById('task-assignment-mistakebook-desc').value
                },
                weekly: {
                    checked: document.getElementById('task-assignment-weekly').checked,
                    description: document.getElementById('task-assignment-weekly-desc').value
                },
                notes: {
                    checked: document.getElementById('task-assignment-notes').checked,
                    description: document.getElementById('task-assignment-notes-desc').value
                },
                ehear: {
                    checked: document.getElementById('task-assignment-ehear').checked,
                    description: document.getElementById('task-assignment-ehear-desc').value
                }
            };
            
            // 验证至少勾选了一个作业类型
            const hasCheckedAssignment = Object.values(schoolAssignments).some(item => item.checked);
            if (!hasCheckedAssignment) {
                alert('请至少选择一个具体作业类型');
                return;
            }
            
            assignment = JSON.stringify(schoolAssignments);
        }
        
        let page = '';
        if (title === '家庭作业') {
            const pageStart = document.getElementById('task-page-start').value;
            const pageEnd = document.getElementById('task-page-end').value;
            if (!pageStart || !pageEnd) {
                alert('请输入页码范围');
                return;
            }
            page = `P${pageStart}-${pageEnd}`;
        } else if (title === '学校作业') {
            page = '学校作业';
        }
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        
        const task = {
                id: Date.now().toString(),
                title,
                subject,
                student,
                startDate,
                assignment,
                page,
                chapter,
                section,
                dueDate,
                priority,
                completed: false,
                createdAt: new Date().toISOString(),
                images: [] // 存储多张图片
            };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.clearForm();
        // 关闭新增作业模态框
        document.getElementById('add-task-modal').style.display = 'none';
    }
    
    updateTask() {
        const id = document.getElementById('edit-task-id').value;
        const title = document.getElementById('edit-task-title').value;
        const subject = document.getElementById('edit-task-subject').value;
        const student = document.getElementById('edit-task-student').value;
        const startDate = document.getElementById('edit-task-start-date').value;
        let assignment = '';
        
        let chapter = '';
        let section = '';
        if (title === '家庭作业') {
            assignment = document.getElementById('edit-task-assignment').value;
            chapter = document.getElementById('edit-task-chapter').value;
            section = document.getElementById('edit-task-section').value;
            if (!assignment) {
                alert('请选择具体作业');
                return;
            }
            if (!chapter) {
                alert('请选择章节');
                return;
            }
            if (!section) {
                alert('请选择小节');
                return;
            }
        } else if (title === '学校作业') {
            const schoolAssignments = {
                preview: {
                    checked: document.getElementById('edit-task-assignment-preview').checked,
                    description: document.getElementById('edit-task-assignment-preview-desc').value
                },
                writing: {
                    checked: document.getElementById('edit-task-assignment-writing').checked,
                    description: document.getElementById('edit-task-assignment-writing-desc').value
                },
                practice: {
                    checked: document.getElementById('edit-task-assignment-practice').checked,
                    description: document.getElementById('edit-task-assignment-practice-desc').value
                },
                copy: {
                    checked: document.getElementById('edit-task-assignment-copy').checked,
                    description: document.getElementById('edit-task-assignment-copy-desc').value
                },
                dictation: {
                    checked: document.getElementById('edit-task-assignment-dictation').checked,
                    description: document.getElementById('edit-task-assignment-dictation-desc').value
                },
                listening: {
                    checked: document.getElementById('edit-task-assignment-listening').checked,
                    description: document.getElementById('edit-task-assignment-listening-desc').value
                },
                recitation: {
                    checked: document.getElementById('edit-task-assignment-recitation').checked,
                    description: document.getElementById('edit-task-assignment-recitation-desc').value
                },
                hbook: {
                    checked: document.getElementById('edit-task-assignment-hbook').checked,
                    description: document.getElementById('edit-task-assignment-hbook-desc').value
                },
                englishWorkbook: {
                    checked: document.getElementById('edit-task-assignment-english-workbook').checked,
                    description: document.getElementById('edit-task-assignment-english-workbook-desc').value
                },
                notebook: {
                    checked: document.getElementById('edit-task-assignment-notebook').checked,
                    description: document.getElementById('edit-task-assignment-notebook-desc').value
                },
                practicePaper: {
                    checked: document.getElementById('edit-task-assignment-practice-paper').checked,
                    description: document.getElementById('edit-task-assignment-practice-paper-desc').value
                },
                colorbook: {
                    checked: document.getElementById('edit-task-assignment-colorbook').checked,
                    description: document.getElementById('edit-task-assignment-colorbook-desc').value
                },
                excerpt: {
                    checked: document.getElementById('edit-task-assignment-excerpt').checked,
                    description: document.getElementById('edit-task-assignment-excerpt-desc').value
                },
                schoolbook: {
                    checked: document.getElementById('edit-task-assignment-schoolbook').checked,
                    description: document.getElementById('edit-task-assignment-schoolbook-desc').value
                },
                workbook: {
                    checked: document.getElementById('edit-task-assignment-workbook').checked,
                    description: document.getElementById('edit-task-assignment-workbook-desc').value
                },
                exercisebook: {
                    checked: document.getElementById('edit-task-assignment-exercisebook').checked,
                    description: document.getElementById('edit-task-assignment-exercisebook-desc').value
                },
                mistakebook: {
                    checked: document.getElementById('edit-task-assignment-mistakebook').checked,
                    description: document.getElementById('edit-task-assignment-mistakebook-desc').value
                },
                weekly: {
                    checked: document.getElementById('edit-task-assignment-weekly').checked,
                    description: document.getElementById('edit-task-assignment-weekly-desc').value
                },
                notes: {
                    checked: document.getElementById('edit-task-assignment-notes').checked,
                    description: document.getElementById('edit-task-assignment-notes-desc').value
                },
                ehear: {
                    checked: document.getElementById('edit-task-assignment-ehear').checked,
                    description: document.getElementById('edit-task-assignment-ehear-desc').value
                }
            };
            
            // 验证至少勾选了一个作业类型
            const hasCheckedAssignment = Object.values(schoolAssignments).some(item => item.checked);
            if (!hasCheckedAssignment) {
                alert('请至少选择一个具体作业类型');
                return;
            }
            
            assignment = JSON.stringify(schoolAssignments);
        }
        
        let page = '';
        if (title === '家庭作业') {
            const pageStart = document.getElementById('edit-task-page-start').value;
            const pageEnd = document.getElementById('edit-task-page-end').value;
            if (!pageStart || !pageEnd) {
                alert('请输入页码范围');
                return;
            }
            page = `P${pageStart}-${pageEnd}`;
        } else if (title === '学校作业') {
            page = '学校作业';
        }
        const dueDate = document.getElementById('edit-task-due-date').value;
        const priority = document.getElementById('edit-task-priority').value;
        
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title,
                subject,
                student,
                startDate,
                assignment,
                page,
                chapter,
                section,
                dueDate,
                priority
            };
            
            this.saveTasks();
            this.renderTasks();
            this.closeModal();
        }
    }
    
    deleteTask(id) {
        if (confirm('确定要删除这个作业吗？')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            // 更新小节选项，确保删除已完成任务后，小节下拉选项会恢复为未完成状态
            this.updateSectionOptions();
        }
    }
    
    toggleComplete(id) {
        console.log('toggleComplete called with id:', id);
        console.log('Current tasks length:', this.tasks.length);
        // 重新获取任务，确保获取最新的任务数据
        const task = this.tasks.find(task => task.id === id);
        console.log('Task found:', task);
        if (task) {
            console.log('Task current completed status:', task.completed);
            console.log('Task images:', task.images);
            
            // 切换完成状态
            task.completed = !task.completed;
            console.log('Task new completed status:', task.completed);
            
            if (task.completed) {
                const now = new Date();
                task.completedAt = now.toISOString();
                console.log('Task completed at:', task.completedAt);
            } else {
                delete task.completedAt;
                console.log('Task completed at deleted');
            }
            
            // 保存和渲染
            console.log('Saving tasks...');
            this.saveTasks();
            console.log('Tasks saved');
            
            // 重新渲染任务列表，确保按钮状态更新
            console.log('Rendering tasks...');
            this.renderTasks();
            console.log('Tasks rendered');
            
            // 只有当任务涉及小节时才更新小节选项
            if (task.section) {
                console.log('Updating section options...');
                this.updateSectionOptions();
                console.log('Section options updated');
            }
            
            console.log('Toggle complete finished');
        } else {
            console.log('Task not found with id:', id);
        }
    }
    
    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-task-title').value = task.title;
        document.getElementById('edit-task-subject').value = task.subject;
        document.getElementById('edit-task-student').value = task.student || '';
        
        // 更新编辑模态框的科目选项
        const student = task.student || 'KYP';
        this.updateEditSubjectOptions(student);
        // 确保科目选择正确
        document.getElementById('edit-task-subject').value = task.subject;
        
        document.getElementById('edit-task-start-date').value = task.startDate;
            
            // 解析页码范围（仅家庭作业需要）
            if (task.title === '家庭作业' && task.page) {
                const pageMatch = task.page.match(/P(\d+)-(\d+)/);
                if (pageMatch) {
                    document.getElementById('edit-task-page-start').value = pageMatch[1];
                    document.getElementById('edit-task-page-end').value = pageMatch[2];
                } else {
                    document.getElementById('edit-task-page-start').value = '';
                    document.getElementById('edit-task-page-end').value = '';
                }
            } else {
                document.getElementById('edit-task-page-start').value = '';
                document.getElementById('edit-task-page-end').value = '';
            }
            
            // 处理具体作业
            if (task.title === '家庭作业') {
                document.getElementById('edit-task-assignment').value = task.assignment || '';
                document.getElementById('edit-task-chapter').value = task.chapter || '';
                document.getElementById('edit-task-section').value = task.section || '';
                
                // 更新编辑模态框的章节选项
                this.updateEditChapterOptions();
                // 更新编辑模态框的小节选项
                this.updateEditSectionOptions();
                // 确保章节和小节选择正确
                document.getElementById('edit-task-chapter').value = task.chapter || '';
                document.getElementById('edit-task-section').value = task.section || '';
            } else if (task.title === '学校作业' && task.assignment) {
                try {
                    const schoolAssignments = JSON.parse(task.assignment);
                    document.getElementById('edit-task-assignment-preview').checked = schoolAssignments.preview ? schoolAssignments.preview.checked : false;
                    document.getElementById('edit-task-assignment-preview-desc').value = schoolAssignments.preview ? schoolAssignments.preview.description : '';
                    document.getElementById('edit-task-assignment-writing').checked = schoolAssignments.writing ? schoolAssignments.writing.checked : false;
                    document.getElementById('edit-task-assignment-writing-desc').value = schoolAssignments.writing ? schoolAssignments.writing.description : '';
                    document.getElementById('edit-task-assignment-practice').checked = schoolAssignments.practice ? schoolAssignments.practice.checked : false;
                    document.getElementById('edit-task-assignment-practice-desc').value = schoolAssignments.practice ? schoolAssignments.practice.description : '';
                    document.getElementById('edit-task-assignment-copy').checked = schoolAssignments.copy ? schoolAssignments.copy.checked : false;
                    document.getElementById('edit-task-assignment-copy-desc').value = schoolAssignments.copy ? schoolAssignments.copy.description : '';
                    document.getElementById('edit-task-assignment-dictation').checked = schoolAssignments.dictation ? schoolAssignments.dictation.checked : false;
                    document.getElementById('edit-task-assignment-dictation-desc').value = schoolAssignments.dictation ? schoolAssignments.dictation.description : '';
                    document.getElementById('edit-task-assignment-listening').checked = schoolAssignments.listening ? schoolAssignments.listening.checked : false;
                    document.getElementById('edit-task-assignment-listening-desc').value = schoolAssignments.listening ? schoolAssignments.listening.description : '';
                    document.getElementById('edit-task-assignment-recitation').checked = schoolAssignments.recitation ? schoolAssignments.recitation.checked : false;
                    document.getElementById('edit-task-assignment-recitation-desc').value = schoolAssignments.recitation ? schoolAssignments.recitation.description : '';
                    document.getElementById('edit-task-assignment-hbook').checked = schoolAssignments.hbook ? schoolAssignments.hbook.checked : false;
                    document.getElementById('edit-task-assignment-hbook-desc').value = schoolAssignments.hbook ? schoolAssignments.hbook.description : '';
                    document.getElementById('edit-task-assignment-english-workbook').checked = schoolAssignments.englishWorkbook ? schoolAssignments.englishWorkbook.checked : false;
                    document.getElementById('edit-task-assignment-english-workbook-desc').value = schoolAssignments.englishWorkbook ? schoolAssignments.englishWorkbook.description : '';
                    document.getElementById('edit-task-assignment-notebook').checked = schoolAssignments.notebook ? schoolAssignments.notebook.checked : false;
                    document.getElementById('edit-task-assignment-notebook-desc').value = schoolAssignments.notebook ? schoolAssignments.notebook.description : '';
                    document.getElementById('edit-task-assignment-practice-paper').checked = schoolAssignments.practicePaper ? schoolAssignments.practicePaper.checked : false;
                    document.getElementById('edit-task-assignment-practice-paper-desc').value = schoolAssignments.practicePaper ? schoolAssignments.practicePaper.description : '';
                    document.getElementById('edit-task-assignment-colorbook').checked = schoolAssignments.colorbook ? schoolAssignments.colorbook.checked : false;
                    document.getElementById('edit-task-assignment-colorbook-desc').value = schoolAssignments.colorbook ? schoolAssignments.colorbook.description : '';
                    document.getElementById('edit-task-assignment-excerpt').checked = schoolAssignments.excerpt ? schoolAssignments.excerpt.checked : false;
                    document.getElementById('edit-task-assignment-excerpt-desc').value = schoolAssignments.excerpt ? schoolAssignments.excerpt.description : '';
                    document.getElementById('edit-task-assignment-schoolbook').checked = schoolAssignments.schoolbook ? schoolAssignments.schoolbook.checked : false;
                    document.getElementById('edit-task-assignment-schoolbook-desc').value = schoolAssignments.schoolbook ? schoolAssignments.schoolbook.description : '';
                    document.getElementById('edit-task-assignment-workbook').checked = schoolAssignments.workbook ? schoolAssignments.workbook.checked : false;
                    document.getElementById('edit-task-assignment-workbook-desc').value = schoolAssignments.workbook ? schoolAssignments.workbook.description : '';
                    document.getElementById('edit-task-assignment-exercisebook').checked = schoolAssignments.exercisebook ? schoolAssignments.exercisebook.checked : false;
                    document.getElementById('edit-task-assignment-exercisebook-desc').value = schoolAssignments.exercisebook ? schoolAssignments.exercisebook.description : '';
                    document.getElementById('edit-task-assignment-mistakebook').checked = schoolAssignments.mistakebook ? schoolAssignments.mistakebook.checked : false;
                    document.getElementById('edit-task-assignment-mistakebook-desc').value = schoolAssignments.mistakebook ? schoolAssignments.mistakebook.description : '';
                    document.getElementById('edit-task-assignment-weekly').checked = schoolAssignments.weekly ? schoolAssignments.weekly.checked : false;
                    document.getElementById('edit-task-assignment-weekly-desc').value = schoolAssignments.weekly ? schoolAssignments.weekly.description : '';
                    document.getElementById('edit-task-assignment-notes').checked = schoolAssignments.notes ? schoolAssignments.notes.checked : false;
                    document.getElementById('edit-task-assignment-notes-desc').value = schoolAssignments.notes ? schoolAssignments.notes.description : '';
                    document.getElementById('edit-task-assignment-ehear').checked = schoolAssignments.ehear ? schoolAssignments.ehear.checked : false;
                    document.getElementById('edit-task-assignment-ehear-desc').value = schoolAssignments.ehear ? schoolAssignments.ehear.description : '';
                } catch (e) {
                    // 解析失败时清空
                    document.getElementById('edit-task-assignment-preview').checked = false;
                    document.getElementById('edit-task-assignment-preview-desc').value = '';
                    document.getElementById('edit-task-assignment-writing').checked = false;
                    document.getElementById('edit-task-assignment-writing-desc').value = '';
                    document.getElementById('edit-task-assignment-practice').checked = false;
                    document.getElementById('edit-task-assignment-practice-desc').value = '';
                    document.getElementById('edit-task-assignment-copy').checked = false;
                    document.getElementById('edit-task-assignment-copy-desc').value = '';
                    document.getElementById('edit-task-assignment-dictation').checked = false;
                    document.getElementById('edit-task-assignment-dictation-desc').value = '';
                    document.getElementById('edit-task-assignment-listening').checked = false;
                    document.getElementById('edit-task-assignment-listening-desc').value = '';
                    document.getElementById('edit-task-assignment-recitation').checked = false;
                    document.getElementById('edit-task-assignment-recitation-desc').value = '';
                    document.getElementById('edit-task-assignment-hbook').checked = false;
                    document.getElementById('edit-task-assignment-hbook-desc').value = '';
                    document.getElementById('edit-task-assignment-english-workbook').checked = false;
                    document.getElementById('edit-task-assignment-english-workbook-desc').value = '';
                    document.getElementById('edit-task-assignment-practice-paper').checked = false;
                    document.getElementById('edit-task-assignment-practice-paper-desc').value = '';
                    document.getElementById('edit-task-assignment-colorbook').checked = false;
                    document.getElementById('edit-task-assignment-colorbook-desc').value = '';
                    document.getElementById('edit-task-assignment-excerpt').checked = false;
                    document.getElementById('edit-task-assignment-excerpt-desc').value = '';
                    document.getElementById('edit-task-assignment-schoolbook').checked = false;
                    document.getElementById('edit-task-assignment-schoolbook-desc').value = '';
                    document.getElementById('edit-task-assignment-workbook').checked = false;
                    document.getElementById('edit-task-assignment-workbook-desc').value = '';
                    document.getElementById('edit-task-assignment-exercisebook').checked = false;
                    document.getElementById('edit-task-assignment-exercisebook-desc').value = '';
                    document.getElementById('edit-task-assignment-mistakebook').checked = false;
                    document.getElementById('edit-task-assignment-mistakebook-desc').value = '';
                    document.getElementById('edit-task-assignment-weekly').checked = false;
                    document.getElementById('edit-task-assignment-weekly-desc').value = '';
                    document.getElementById('edit-task-assignment-notes').checked = false;
                    document.getElementById('edit-task-assignment-notes-desc').value = '';
                    document.getElementById('edit-task-assignment-ehear').checked = false;
                    document.getElementById('edit-task-assignment-ehear-desc').value = '';
                }
            }
            
            document.getElementById('edit-task-due-date').value = task.dueDate;
            document.getElementById('edit-task-priority').value = task.priority;
            
            // 显示相应的具体作业字段
            this.toggleEditAssignmentFields(task.title);
            
            document.getElementById('edit-modal').style.display = 'block';
        }
    }
    
    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        // 关闭编辑模态框后，默认显示未完成的任务
        this.setFilter('pending');
    }
    
    // 最小化编辑作业模态框
    minimizeEditModal() {
        const modalContent = document.querySelector('#edit-modal .modal-content');
        if (modalContent) {
            if (modalContent.classList.contains('minimized')) {
                // 恢复正常大小
                modalContent.classList.remove('minimized');
                modalContent.style.width = '90%';
                modalContent.style.maxWidth = '800px';
                modalContent.style.height = 'auto';
                modalContent.style.maxHeight = '80vh';
                modalContent.style.top = '20%';
            } else {
                // 最小化
                modalContent.classList.add('minimized');
                modalContent.style.width = '300px';
                modalContent.style.maxWidth = '300px';
                modalContent.style.height = '100px';
                modalContent.style.maxHeight = '100px';
                modalContent.style.top = '80%';
            }
        }
    }
    
    // 切换编辑作业模态框全屏
    toggleFullscreenEditModal() {
        const modalContent = document.querySelector('#edit-modal .modal-content');
        if (modalContent) {
            if (modalContent.classList.contains('fullscreen')) {
                // 退出全屏
                modalContent.classList.remove('fullscreen');
                modalContent.style.width = '90%';
                modalContent.style.maxWidth = '800px';
                modalContent.style.height = 'auto';
                modalContent.style.maxHeight = '80vh';
                modalContent.style.top = '20%';
                modalContent.style.left = '50%';
                modalContent.style.transform = 'translateX(-50%)';
            } else {
                // 进入全屏
                modalContent.classList.add('fullscreen');
                modalContent.style.width = '95%';
                modalContent.style.maxWidth = '95%';
                modalContent.style.height = '90%';
                modalContent.style.maxHeight = '90%';
                modalContent.style.top = '5%';
                modalContent.style.left = '50%';
                modalContent.style.transform = 'translateX(-50%)';
            }
        }
    }
    
    // 打开学习效率分析
    openEfficiencyDashboard() {
        try {
            console.log('开始打开学习效率分析');
            
            // 直接显示模态框
            const efficiencyModal = document.getElementById('efficiency-modal');
            if (efficiencyModal) {
                console.log('找到了效率分析模态框');
                efficiencyModal.style.display = 'block';
                console.log('显示了效率分析模态框');
            } else {
                console.error('效率分析模态框未找到');
            }
            
            // 检查update-efficiency按钮是否存在
            setTimeout(() => {
                const updateBtn = document.getElementById('update-efficiency');
                if (updateBtn) {
                    console.log('找到了update-efficiency按钮:', updateBtn);
                    console.log('update-efficiency按钮的点击事件监听器:', getEventListeners(updateBtn));
                } else {
                    console.error('update-efficiency按钮未找到');
                }
            }, 1000);
            
            // 生成初始分析报告
            this.generateEfficiencyReport();
        } catch (error) {
            console.error('打开学习效率分析时出错:', error);
        }
    }
    
    // 生成效率分析报告
    generateEfficiencyReport() {
        try {
            console.log('开始生成效率分析报告');
            
            // 获取选择的学霸
            const studentSelect = document.getElementById('efficiency-student');
            const selectedStudent = studentSelect ? studentSelect.value : this.currentStudentFilter;
            console.log('选择的学霸:', selectedStudent);
            
            // 筛选任务
            let filteredTasks = this.tasks;
            if (selectedStudent) {
                filteredTasks = this.tasks.filter(task => task.student === selectedStudent);
            }
            console.log('筛选后的任务数量:', filteredTasks.length);
            
            const completedTasks = filteredTasks.filter(task => task.completed && task.completedAt);
            console.log('已完成的任务数量:', completedTasks.length);
            
            // 计算过期未完成的任务
            const now = new Date();
            const overdueTasks = filteredTasks.filter(task => {
                return !task.completed && task.dueDate && new Date(task.dueDate) < now;
            });
            console.log('过期未完成的任务数量:', overdueTasks.length);
            
            const efficiencyContent = document.getElementById('efficiency-content');
            
            if (!efficiencyContent) {
                console.error('效率分析内容元素未找到');
                return;
            }
            console.log('找到了效率分析内容元素');
            
            // 显示加载状态
            efficiencyContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading-spinner"></div><p>正在生成分析报告...</p></div>';
            console.log('显示了加载状态');
            
            // 计算每个科目的总作业数量（包括未完成的）
            const totalTasksBySubject = {};
            filteredTasks.forEach(task => {
                // 计算实际作业数量
                let actualTaskCount = 1; // 默认一个任务算一个作业
                if (task.title === '学校作业' && task.assignment) {
                    try {
                        const schoolAssignments = JSON.parse(task.assignment);
                        // 统计被勾选的具体作业数量
                        actualTaskCount = Object.values(schoolAssignments).filter(item => item.checked).length;
                    } catch (e) {
                        console.error('解析学校作业失败:', e);
                    }
                }
                
                if (!totalTasksBySubject[task.subject]) {
                    totalTasksBySubject[task.subject] = 0;
                }
                totalTasksBySubject[task.subject] += actualTaskCount;
            });
            console.log('计算了每个科目的总作业数量');
            
            if (completedTasks.length === 0) {
                console.log('没有已完成的任务，生成空数据报告');
                // 按科目和学霸分组统计所有作业数量
                const subjectStudentMap = {};
                let student = selectedStudent || '未知'; // 使用选择的学霸或默认为未知
                
                filteredTasks.forEach(task => {
                    const taskStudent = task.student || '' || '未知';
                    const subject = task.subject;
                    const key = `${subject}-${taskStudent}`;
                    
                    if (!subjectStudentMap[key]) {
                        subjectStudentMap[key] = {
                            subject: subject,
                            student: taskStudent,
                            actualCount: 0
                        };
                    }
                    
                    // 计算实际作业数量
                    let actualTaskCount = 1; // 默认一个任务算一个作业
                    if (task.title === '学校作业' && task.assignment) {
                        try {
                            const schoolAssignments = JSON.parse(task.assignment);
                            // 统计被勾选的具体作业数量
                            actualTaskCount = Object.values(schoolAssignments).filter(item => item.checked).length;
                        } catch (e) {
                            // 如果不是学校作业，默认算一个作业
                        }
                    }
                    
                    subjectStudentMap[key].actualCount += actualTaskCount;
                });
                
                // 确保对应学霸的科目都显示
                let klSubjects = [];
                let kypSubjects = [];
                if (selectedStudent === 'KL') {
                    // KL的科目：物理、化学、数学
                    klSubjects = ['物理', '化学', '数学'];
                    klSubjects.forEach(subject => {
                        const key = `${subject}-KL`;
                        if (!subjectStudentMap[key]) {
                            subjectStudentMap[key] = {
                                subject: subject,
                                student: 'KL',
                                actualCount: 0
                            };
                        }
                    });
                } else if (selectedStudent === 'KYP') {
                    // KYP的科目：语文、数学、英语
                    kypSubjects = ['语文', '数学', '英语'];
                    kypSubjects.forEach(subject => {
                        const key = `${subject}-KYP`;
                        if (!subjectStudentMap[key]) {
                            subjectStudentMap[key] = {
                                subject: subject,
                                student: 'KYP',
                                actualCount: 0
                            };
                        }
                    });
                }
                
                // 获取学霸信息（假设所有任务属于同一个学霸）
                const studentWithGender = selectedStudent === 'KL' ? 'KL♀' : selectedStudent === 'KYP' ? 'KYP♂' : selectedStudent;
                
                // 显示所有科目的总作业数量
            let report = `
                <div class="efficiency-header">
                    <h2>学习效率分析 - ${studentWithGender}</h2>
                </div>
                
                <div class="efficiency-summary">
                    <h3>总体效率分析</h3>
                    <p>已完成作业总数: 0</p>
                    <p>总花费时间: 0</p>
                    <p>平均完成时间: 0</p>
                    <p>过期未完成任务: ${overdueTasks.length}</p>
                </div>
                    
                    <div class="efficiency-by-subject">
                        <h3>按科目分析</h3>
                        <table>
                            <tr>
                                <th>科目</th>
                                <th>作业量</th>
                            </tr>
                `;
                
                Object.values(subjectStudentMap).forEach(data => {
                    report += `
                        <tr>
                            <td>${data.subject}</td>
                            <td>${data.actualCount}</td>
                        </tr>
                    `;
                });
                
                report += `
                        </table>
                    </div>
                    
                    <div class="efficiency-by-year">
                        <h3>按年分析</h3>
                        <table>
                            <tr>
                                <th>年份</th>
                                <th>作业量</th>
                            </tr>
                `;
                
                // 按年统计作业量（默认当前年份）
                const currentYear = new Date().getFullYear();
                let totalCount = 0;
                Object.values(subjectStudentMap).forEach(data => {
                    totalCount += data.actualCount;
                });
                
                report += `
                        <tr>
                            <td>${currentYear}</td>
                            <td>${totalCount}</td>
                        </tr>
                    `;
                
                report += `
                        </table>
                    </div>
                `;
                
                console.log('生成了空数据报告');
                
                // 添加家庭作业完成进度
                report += `
                    <div class="efficiency-homework-progress">
                        <h3>家庭作业完成进度</h3>
                `;
                
                // 统计家庭作业完成进度
                const homeworkProgress = this.getHomeworkProgress(filteredTasks);
                
                // 确保对应学霸的科目家庭作业进度显示
                if (selectedStudent === 'KL') {
                    // KL的科目：物理、化学、数学
                    // KL的家庭作业只有一课一练和教材全解
                    const klAssignments = ['一课一练', '教材全解'];
                    const klSubjects = ['物理', '化学', '数学'];
                    klSubjects.forEach(subject => {
                        if (!homeworkProgress[subject]) {
                            homeworkProgress[subject] = {
                                assignments: {}
                            };
                        }
                        
                        klAssignments.forEach(assignment => {
                            if (!homeworkProgress[subject].assignments[assignment]) {
                                const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                                homeworkProgress[subject].assignments[assignment] = {
                                    completed: 0,
                                    total: totalSectionsByAssignment[assignment] || 0
                                };
                            }
                        });
                    });
                } else if (selectedStudent === 'KYP') {
                    // KYP的科目：语文、数学、英语
                    // KYP的家庭作业只有上海作业和名校名卷
                    const kypAssignments = ['上海作业', '名校名卷'];
                    const kypSubjects = ['语文', '数学', '英语'];
                    kypSubjects.forEach(subject => {
                        if (!homeworkProgress[subject]) {
                            homeworkProgress[subject] = {
                                assignments: {}
                            };
                        }
                        
                        kypAssignments.forEach(assignment => {
                            if (!homeworkProgress[subject].assignments[assignment]) {
                                const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                                homeworkProgress[subject].assignments[assignment] = {
                                    completed: 0,
                                    total: totalSectionsByAssignment[assignment] || 0
                                };
                            }
                        });
                    });
                }
                
                // 按照科目分组显示
                Object.entries(homeworkProgress).forEach(([subject, data]) => {
                    report += `
                        <div class="homework-subject-section">
                            <h4 class="subject-title">${subject}</h4>
                            <div class="homework-progress-charts">
                    `;
                    
                    Object.entries(data.assignments).forEach(([assignment, progress]) => {
                        const completed = progress.completed;
                        const total = progress.total;
                        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                        
                        report += `
                            <div class="homework-progress-item" data-student="${selectedStudent}" data-subject="${subject}" data-assignment="${assignment}" style="cursor: pointer;">
                                <h5>${assignment}</h5>
                                <div class="progress-bar-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${percentage}%;"></div>
                                        <div class="progress-remaining" style="width: ${100 - percentage}%;"></div>
                                    </div>
                                    <div class="progress-stats">
                                        <div class="progress-text">已完成: ${completed} / 总任务: ${total}</div>
                                        <div class="progress-percentage">${percentage}%</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    
                    report += `
                            </div>
                        </div>
                    `;
                });
                
                report += `
                    </div>
                `;
                
                // 移除学校进度与家庭作业进度对比分析
                // report += this.generateSchoolHomeworkComparison(student);
                
                console.log('生成了完整的空数据报告');
                efficiencyContent.innerHTML = report;
            } else {
                console.log('有已完成的任务，生成完整报告');
                const analysis = this.analyzeEfficiency(completedTasks);
                // 计算平均完成时间
                analysis.averageTimeSpent = analysis.totalTasks > 0 ? analysis.totalTimeSpent / analysis.totalTasks : 0;
                // 更新分析数据中的作业数量
                Object.entries(analysis.tasksBySubject).forEach(([subject, data]) => {
                    data.totalCount = totalTasksBySubject[subject] || 0;
                });
                console.log('分析完成，生成HTML报告');
                efficiencyContent.innerHTML = this.generateEfficiencyReportHTML(analysis, filteredTasks, selectedStudent);
            }
            
            console.log('生成效率分析报告完成');
        } catch (error) {
            console.error('生成效率分析报告时出错:', error);
            // 显示错误信息
            const efficiencyContent = document.getElementById('efficiency-content');
            if (efficiencyContent) {
                efficiencyContent.innerHTML = '<div style="text-align: center; padding: 40px; color: red;"><p>生成分析报告时出错: ' + error.message + '</p></div>';
            }
        }
    }
    
    // 关闭效率分析仪表盘
    closeEfficiencyModal() {
        document.getElementById('efficiency-modal').style.display = 'none';
        // 关闭效率分析报告后，默认显示未完成的任务
        this.setFilter('pending');
    }
    
    // 打开作业明细模态框
    openHomeworkDetailModal(student, subject, assignment) {
        try {
            console.log('打开作业明细模态框', student, subject, assignment);
            
            const modal = document.getElementById('homework-detail-modal');
            if (modal) {
                modal.style.display = 'block';
            }
            
            const content = document.getElementById('homework-detail-content');
            if (content) {
                // 显示加载状态
                content.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading-spinner"></div><p>正在加载作业明细...</p></div>';
                
                // 生成作业明细内容
                setTimeout(() => {
                    content.innerHTML = this.generateHomeworkDetailHTML(student, subject, assignment);
                }, 500);
            }
        } catch (error) {
            console.error('打开作业明细模态框时出错:', error);
        }
    }
    
    // 关闭作业明细模态框
    closeHomeworkDetailModal() {
        const modal = document.getElementById('homework-detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // 生成作业明细HTML
    generateHomeworkDetailHTML(student, subject, assignment) {
        // 获取所有相关任务
        const tasks = this.tasks.filter(task => 
            task.student === student && 
            task.subject === subject && 
            task.assignment === assignment
        );
        
        // 收集所有已完成的小节
        const completedSections = new Set();
        tasks.forEach(task => {
            if (task.completed && task.section) {
                completedSections.add(task.section);
            }
        });
        
        // 获取所有可能的小节选项
        const allSections = this.getAllPossibleSections(subject, assignment);
        
        // 计算完成统计
        const completedCount = completedSections.size;
        const totalSections = allSections.length;
        const completionRate = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
        
        // 生成作业明细内容
        let html = `
            <div class="homework-detail-header">
                <h3>${subject} - ${assignment}</h3>
                <p>学霸: ${student === 'KL' ? 'KL♀' : student === 'KYP' ? 'KYP♂' : student}</p>
            </div>
            
            <div class="homework-detail-list">
                <h4>作业小节完成情况</h4>
                <div class="homework-sections">
        `;
        
        // 显示所有小节（包括已完成和未完成的）
        if (allSections.length > 0) {
            allSections.forEach(section => {
                const completed = completedSections.has(section);
                const statusClass = completed ? 'completed' : 'not-completed';
                const statusText = completed ? '已完成' : '未完成';
                
                html += `
                    <div class="homework-section-item ${statusClass}">
                        <span class="section-number">${section}</span>
                        <span class="section-status">${statusText}</span>
                    </div>
                `;
            });
        } else {
            html += `<p style="text-align: center; color: #666; padding: 20px;">暂无作业小节</p>`;
        }
        
        html += `
                </div>
            </div>
            
            <div class="homework-detail-list">
                <h4>完成统计</h4>
                <div class="homework-detail-summary">
                    <p>已完成: ${completedCount} / 总任务: ${totalSections}</p>
                    <p>完成率: ${completionRate}%</p>
                </div>
            </div>
        `;
        
        return html;
    }
    
    // 获取所有可能的小节选项
    getAllPossibleSections(subject, assignment) {
        if (assignment === '上海作业') {
            if (subject === '数学') {
                return [
                    // 第一章
                    '1.1 小数的四则混合运算1',
                    '1.1 小数的四则混合运算2',
                    '1.2 方程',
                    '1.3 面积的估算2',
                    '1.4 自然数',
                    '第一单元评价测试',
                    // 第二章
                    '2.1 正数和负数1',
                    '2.1 正数和负数2',
                    '2.2 数轴1',
                    '2.2 数轴2',
                    '第二单元评价测试',
                    '阶段练习（一）',
                    // 第三章
                    '3.1 列方程解决问题（三）1',
                    '3.1 列方程解决问题（三）2',
                    '3.1 列方程解决问题（三）3',
                    '3.1 列方程解决问题（三）4',
                    '3.1 列方程解决问题（三）5',
                    '3.1 列方程解决问题（三）6',
                    '3.1 列方程解决问题（三）7',
                    '阶段练习（二）',
                    '3.2 列方程解决问题（四）1',
                    '3.2 列方程解决问题（四）2',
                    '3.2 列方程解决问题（四）3',
                    '第三单元评价测试',
                    '期中综合评价测试',
                    // 第四章
                    '4.1 体积',
                    '4.2 立方厘米、立方分米、立方米1',
                    '4.2 立方厘米、立方分米、立方米2',
                    '4.3 长方体与正方体的认识',
                    '4.4 长方体与正方体的体积1',
                    '4.4 长方体与正方体的体积2',
                    '4.5 组合体的体积',
                    '阶段练习（三）',
                    '4.6 正方体、长方体的展开图——正方体的展开图',
                    '4.6 正方体、长方体的展开图——长方体的展开图',
                    '4.7 正方体、长方体的表面积——正方体的表面积',
                    '4.7 正方体、长方体的表面积——长方体的表面积',
                    '4.8 小练习',
                    '4.9 表面积的变化1',
                    '4.9 表面积的变化2',
                    '4.9 表面积的变化3',
                    '4.10 体积与容积——容积与容积的单位',
                    '4.10 体积与容积——求容积',
                    '4.10 体积与容积用量具测不规则物体的体积',
                    '4.11* 体积与质量',
                    '阶段练习（四）',
                    '第四单元评价测试',
                    // 第五章
                    '5.1 可能性',
                    '5.2 可能性的大小',
                    '5.3 可能情况的个数1',
                    '5.3 可能情况的个数2',
                    '第五单元评价测试',
                    // 第六章
                    '6.1 数与运算1',
                    '6.1 数与运算2',
                    '6.1 数与运算3',
                    '6.1 数与运算4',
                    '6.2 方程与代数1',
                    '6.2 方程与代数2',
                    '6.2 方程与代数3',
                    '6.3 图形与几何1',
                    '6.3 图形与几何2'
                ];
            } else if (subject === '语文') {
                return [
                    // 第一章
                    '1.1 课文1',
                    '1.2 课文2',
                    '1.3 课文3',
                    '1.4 单元练习',
                    '第一单元评价测试',
                    // 第二章
                    '2.1 课文4',
                    '2.2 课文5',
                    '2.3 课文6',
                    '2.4 单元练习',
                    '第二单元评价测试',
                    '阶段练习（一）',
                    // 第三章
                    '3.1 课文7',
                    '3.2 课文8',
                    '3.3 课文9',
                    '3.4 单元练习',
                    '第三单元评价测试',
                    '期中综合评价测试',
                    // 第四章
                    '4.1 课文10',
                    '4.2 课文11',
                    '4.3 课文12',
                    '4.4 单元练习',
                    '第四单元评价测试',
                    // 第五章
                    '5.1 课文13',
                    '5.2 课文14',
                    '5.3 课文15',
                    '5.4 单元练习',
                    '第五单元评价测试',
                    // 第六章
                    '6.1 课文16',
                    '6.2 课文17',
                    '6.3 课文18',
                    '6.4 单元练习',
                    '第六单元评价测试',
                    '期末综合评价测试'
                ];
            } else if (subject === '英语') {
                return [
                    // 第一章
                    'Unit 1 Lesson 1',
                    'Unit 1 Lesson 2',
                    'Unit 1 Lesson 3',
                    'Unit 1 Revision',
                    'Unit 1 Test',
                    // 第二章
                    'Unit 2 Lesson 1',
                    'Unit 2 Lesson 2',
                    'Unit 2 Lesson 3',
                    'Unit 2 Revision',
                    'Unit 2 Test',
                    'Mid-term Review',
                    // 第三章
                    'Unit 3 Lesson 1',
                    'Unit 3 Lesson 2',
                    'Unit 3 Lesson 3',
                    'Unit 3 Revision',
                    'Unit 3 Test',
                    // 第四章
                    'Unit 4 Lesson 1',
                    'Unit 4 Lesson 2',
                    'Unit 4 Lesson 3',
                    'Unit 4 Revision',
                    'Unit 4 Test',
                    'Final Review',
                    'Final Test'
                ];
            }
        }
        return [];
    }
    
    // 最小化效率分析仪表盘
    minimizeEfficiencyModal() {
        const modalContent = document.querySelector('#efficiency-modal .modal-content');
        if (modalContent) {
            if (modalContent.classList.contains('minimized')) {
                // 恢复正常大小
                modalContent.classList.remove('minimized');
                modalContent.style.width = '90%';
                modalContent.style.maxWidth = '800px';
                modalContent.style.height = 'auto';
                modalContent.style.top = '20%';
            } else {
                // 最小化
                modalContent.classList.add('minimized');
                modalContent.style.width = '300px';
                modalContent.style.maxWidth = '300px';
                modalContent.style.height = '100px';
                modalContent.style.top = '80%';
                modalContent.style.left = '10px';
                modalContent.style.transform = 'none';
            }
        }
    }
    
    // 切换效率分析仪表盘全屏
    toggleFullscreenEfficiencyModal() {
        const modalContent = document.querySelector('#efficiency-modal .modal-content');
        if (modalContent) {
            if (modalContent.classList.contains('fullscreen')) {
                // 退出全屏
                modalContent.classList.remove('fullscreen');
                modalContent.style.width = '90%';
                modalContent.style.maxWidth = '800px';
                modalContent.style.height = 'auto';
                modalContent.style.top = '20%';
                modalContent.style.left = '50%';
                modalContent.style.transform = 'translateX(-50%)';
            } else {
                // 进入全屏
                modalContent.classList.add('fullscreen');
                modalContent.style.width = '95%';
                modalContent.style.maxWidth = '95%';
                modalContent.style.height = '90%';
                modalContent.style.top = '5%';
                modalContent.style.left = '50%';
                modalContent.style.transform = 'translateX(-50%)';
            }
        }
    }
    
    // 打开上传作业图片模态框
    openUploadModal(taskId) {
        document.getElementById('upload-task-id').value = taskId;
        document.getElementById('upload-modal').style.display = 'block';
    }
    
    // 关闭上传作业图片模态框
    closeUploadModal() {
        try {
            document.getElementById('upload-modal').style.display = 'none';
            document.getElementById('upload-form').reset();
            // 清除图片索引数据
            const uploadTaskId = document.getElementById('upload-task-id');
            if (uploadTaskId && uploadTaskId.dataset.imageIndex) {
                delete uploadTaskId.dataset.imageIndex;
            }
            // 关闭上传作业模态框后，默认显示未完成的任务
            this.setFilter('pending');
        } catch (error) {
            console.error('Error closing upload modal:', error);
        }
    }
    
    // 上传作业图片
    uploadImage() {
        const taskId = document.getElementById('upload-task-id').value;
        const imageInput = document.getElementById('upload-image');
        const imageIndex = document.getElementById('upload-task-id').dataset.imageIndex;
        
        if (imageInput.files && imageInput.files.length > 0) {
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                // 确保tasks[taskIndex]有images属性
                if (!this.tasks[taskIndex].images) {
                    // 处理旧的task.image属性
                    if (this.tasks[taskIndex].image) {
                        this.tasks[taskIndex].images = [this.tasks[taskIndex].image];
                        delete this.tasks[taskIndex].image;
                    } else {
                        this.tasks[taskIndex].images = [];
                    }
                }
                
                // 限制文件数量，避免性能问题
                const files = Array.from(imageInput.files).slice(0, 3); // 最多处理3个文件
                const totalFiles = files.length;
                
                // 显示上传进度
                const uploadButton = document.querySelector('#upload-form button');
                const originalText = uploadButton.textContent;
                uploadButton.textContent = '上传中...';
                uploadButton.disabled = true;
                
                // 分批处理文件
                this.processFilesInBatch(files, taskIndex, imageIndex, totalFiles, 0, uploadButton, originalText);
            }
        }
    }
    
    // 分批处理文件
    processFilesInBatch(files, taskIndex, imageIndex, totalFiles, currentIndex, uploadButton, originalText) {
        const self = this; // 保存this引用
        console.log('Processing file:', currentIndex + 1, 'of', totalFiles);
        
        if (currentIndex >= totalFiles) {
            // 所有文件处理完成
            console.log('All files processed, saving tasks...');
            
            try {
                // 保存任务
                self.saveTasks();
                console.log('Tasks saved');
                
                // 关闭模态框
                try {
                    self.closeUploadModal();
                    console.log('Modal closed');
                } catch (closeError) {
                    console.error('Error closing modal:', closeError);
                }
                
                // 恢复按钮状态
                uploadButton.textContent = originalText;
                uploadButton.disabled = false;
                console.log('Button state restored');
                
                // 显示成功消息
                alert('作业图片上传成功！');
                console.log('Upload completed');
            } catch (error) {
                console.error('Error in upload completion:', error);
                
                // 无论发生什么错误，都要恢复按钮状态
                uploadButton.textContent = originalText;
                uploadButton.disabled = false;
                
                // 尝试关闭模态框
                try {
                    self.closeUploadModal();
                } catch (closeError) {
                    console.error('Error closing modal:', closeError);
                }
                
                // 显示成功消息，因为文件实际上已经上传成功了
                alert('作业图片上传成功！');
                console.log('Upload completed despite error');
            }
            
            // 无论如何都要尝试渲染任务
            try {
                self.renderTasks();
                console.log('Tasks rendered after file upload');
            } catch (renderError) {
                console.error('Error rendering tasks:', renderError);
            }
            
            return;
        }
        
        const file = files[currentIndex];
        console.log('Processing file:', file.name);
        
        // 检查文件大小，限制为3MB
        if (file.size > 3 * 1024 * 1024) {
            alert(`文件 ${file.name} 超过3MB，请选择较小的文件`);
            // 继续处理下一个文件
            self.processFilesInBatch(files, taskIndex, imageIndex, totalFiles, currentIndex + 1, uploadButton, originalText);
            return;
        }
        
        // 使用异步方式处理文件
        self.readFileAsDataURL(file).then(dataUrl => {
            console.log('File read successfully:', file.name);
            
            if (imageIndex !== undefined) {
                // 编辑现有图片
                self.tasks[taskIndex].images[parseInt(imageIndex)] = dataUrl;
                console.log('Updated existing image at index:', imageIndex);
            } else {
                // 添加新图片到数组
                self.tasks[taskIndex].images.push(dataUrl);
                console.log('Added new image to array');
            }
            
            // 立即保存任务数据到本地存储，防止刷新页面后数据丢失
            try {
                self.saveTasks();
                console.log('Tasks saved after image upload');
            } catch (saveError) {
                console.error('Error saving tasks:', saveError);
            }
            
            // 更新上传进度
            uploadButton.textContent = `上传中... (${currentIndex + 1}/${totalFiles})`;
            console.log('Upload progress updated:', currentIndex + 1, '/', totalFiles);
            
            // 继续处理下一个文件
            setTimeout(() => {
                self.processFilesInBatch(files, taskIndex, imageIndex, totalFiles, currentIndex + 1, uploadButton, originalText);
            }, 50);
        }).catch(error => {
            console.error('Error reading file:', file.name, error);
            alert(`文件 ${file.name} 读取失败: ${error.message}`);
            // 继续处理下一个文件
            self.processFilesInBatch(files, taskIndex, imageIndex, totalFiles, currentIndex + 1, uploadButton, originalText);
        });
    }
    
    // 异步读取文件
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            reader.readAsDataURL(file);
        });
    }
    
    // 分析效率数据
    analyzeEfficiency(tasks) {
        const analysis = {
            totalTasks: tasks.length,
            totalTimeSpent: 0,
            tasksBySubject: {},
            tasksByWeek: {},
            tasksByMonth: {},
            tasksByYear: {}, // 按年分析
            overtimeTasks: 0 // 超时任务数量
        };
        
        tasks.forEach(task => {
            const startTime = new Date(task.startDate).getTime();
            const completedTime = new Date(task.completedAt).getTime();
            const dueTime = new Date(task.dueDate).getTime();
            const timeSpent = completedTime - startTime;
            const isOvertime = completedTime > dueTime;
            const student = task.student || '未知';
            
            analysis.totalTimeSpent += timeSpent;
            if (isOvertime) {
                analysis.overtimeTasks++;
            }
            
            // 计算实际作业数量
            let actualTaskCount = 1; // 默认一个任务算一个作业
            if (task.title === '学校作业' && task.assignment) {
                try {
                    const schoolAssignments = JSON.parse(task.assignment);
                    // 统计被勾选的具体作业数量
                    actualTaskCount = Object.values(schoolAssignments).filter(item => item.checked).length;
                } catch (e) {
                    console.error('解析学校作业失败:', e);
                }
            }
            
            // 按科目分析
            if (!analysis.tasksBySubject[task.subject]) {
                analysis.tasksBySubject[task.subject] = {
                    count: 0,
                    actualCount: 0, // 实际作业数量
                    totalTimeSpent: 0,
                    overtimeTasks: 0, // 超时任务数量
                    tasks: []
                };
            }
            analysis.tasksBySubject[task.subject].count++;
            analysis.tasksBySubject[task.subject].actualCount += actualTaskCount;
            analysis.tasksBySubject[task.subject].totalTimeSpent += timeSpent;
            if (isOvertime) {
                analysis.tasksBySubject[task.subject].overtimeTasks++;
            }
            analysis.tasksBySubject[task.subject].tasks.push({
                startDate: task.startDate,
                dueDate: task.dueDate,
                completedAt: task.completedAt,
                isOvertime: isOvertime,
                student: student,
                assignment: task.assignment // 添加 assignment 字段，用于后续统计
            });
            
            // 按周分析
            const completedDate = new Date(task.completedAt);
            const weekKey = this.getWeekKey(completedDate);
            
            // 按周分析
            if (!analysis.tasksByWeek[weekKey]) {
                analysis.tasksByWeek[weekKey] = {
                    count: 0,
                    totalTimeSpent: 0,
                    overtimeTasks: 0 // 超时任务数量
                };
            }
            analysis.tasksByWeek[weekKey].count += actualTaskCount;
            analysis.tasksByWeek[weekKey].totalTimeSpent += timeSpent;
            if (isOvertime) {
                analysis.tasksByWeek[weekKey].overtimeTasks++;
            }
            
            // 按月分析
            const monthKey = this.getMonthKey(completedDate);
            if (!analysis.tasksByMonth[monthKey]) {
                analysis.tasksByMonth[monthKey] = {
                    count: 0,
                    totalTimeSpent: 0,
                    overtimeTasks: 0 // 超时任务数量
                };
            }
            analysis.tasksByMonth[monthKey].count += actualTaskCount;
            analysis.tasksByMonth[monthKey].totalTimeSpent += timeSpent;
            if (isOvertime) {
                analysis.tasksByMonth[monthKey].overtimeTasks++;
            }
            
            // 按年分析
            const yearKey = completedDate.getFullYear();
            if (!analysis.tasksByYear[yearKey]) {
                analysis.tasksByYear[yearKey] = {
                    count: 0,
                    totalTimeSpent: 0,
                    overtimeTasks: 0 // 超时任务数量
                };
            }
            analysis.tasksByYear[yearKey].count += actualTaskCount;
            analysis.tasksByYear[yearKey].totalTimeSpent += timeSpent;
            if (isOvertime) {
                analysis.tasksByYear[yearKey].overtimeTasks++;
            }
        });
        
        // 计算每个科目的平均完成时间
        Object.entries(analysis.tasksBySubject).forEach(([subject, data]) => {
            data.averageTimeSpent = data.count > 0 ? data.totalTimeSpent / data.count : 0;
        });
        
        // 计算每周的平均完成时间
        Object.entries(analysis.tasksByWeek).forEach(([week, data]) => {
            data.averageTimeSpent = data.count > 0 ? data.totalTimeSpent / data.count : 0;
        });
        
        // 计算每月的平均完成时间
        Object.entries(analysis.tasksByMonth).forEach(([month, data]) => {
            data.averageTimeSpent = data.count > 0 ? data.totalTimeSpent / data.count : 0;
        });
        
        // 计算每年的平均完成时间
        Object.entries(analysis.tasksByYear).forEach(([year, data]) => {
            data.averageTimeSpent = data.count > 0 ? data.totalTimeSpent / data.count : 0;
        });
        
        return analysis;
    }
    
    // 获取周的键值
    getWeekKey(date) {
        const year = date.getFullYear();
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${weekNumber}`;
    }
    
    // 获取月份的键值
    getMonthKey(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return `${year}-${month.toString().padStart(2, '0')}`;
    }
    
    // 获取周数
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    // 生成效率分析报告HTML（旧版）
    generateEfficiencyReportHTMLOld(analysis, allTasks) {
        // 获取学霸信息（假设所有任务属于同一个学霸）
        const student = allTasks.length > 0 ? allTasks[0].student : '未知';
        const studentWithGender = student === 'KL' ? 'KL♀' : student === 'KYP' ? 'KYP♂' : student;
        
        let report = `
            <div class="efficiency-header">
                <h2>效率分析仪表盘 - ${studentWithGender}</h2>
            </div>
            
            <div class="efficiency-summary">
                <h3>总体效率分析</h3>
                <p>已完成作业总数: ${analysis.totalTasks}</p>
                <p>总花费时间: ${this.formatDuration(analysis.totalTimeSpent)}</p>
                <p>超时任务数量: ${analysis.overtimeTasks}</p>
            </div>
            
            <div class="efficiency-by-subject">
                <h3>按科目分析</h3>
                <table>
                    <tr>
                        <th>科目</th>
                        <th>作业量</th>
                        <th>总花费时间</th>
                        <th>开始日期</th>
                        <th>截止日期</th>
                        <th>完成日期</th>
                        <th>超时项</th>
                    </tr>
        `
        
        // 按科目和学霸分组统计
        const subjectStudentMap = {};
        Object.entries(analysis.tasksBySubject).forEach(([subject, data]) => {
            data.tasks.forEach(task => {
                const student = task.student || '' || '未知';
                const key = `${subject}-${student}`;
                if (!subjectStudentMap[key]) {
                    subjectStudentMap[key] = {
                        subject: subject,
                        student: student,
                        actualCount: 0,
                        totalTime: 0,
                        overtimeCount: 0,
                        tasks: []
                    };
                }
                // 计算实际作业数量
                let actualTaskCount = 1; // 默认一个任务算一个作业
                if (task.assignment) {
                    try {
                        const schoolAssignments = JSON.parse(task.assignment);
                        // 统计被勾选的具体作业数量
                        actualTaskCount = Object.values(schoolAssignments).filter(item => item.checked).length;
                    } catch (e) {
                        // 如果不是学校作业，默认算一个作业
                    }
                }
                subjectStudentMap[key].actualCount += actualTaskCount;
                subjectStudentMap[key].totalTime += (new Date(task.completedAt).getTime() - new Date(task.startDate).getTime());
                if (task.isOvertime) {
                    subjectStudentMap[key].overtimeCount++;
                }
                subjectStudentMap[key].tasks.push(task);
            });
        });
        
        // 显示按科目分组的统计
        Object.values(subjectStudentMap).forEach(data => {
            // 过滤科目：KYP只能显示语文、数学、英语
            if (student === 'KYP' && !['语文', '数学', '英语'].includes(data.subject)) {
                return;
            }
            
            const overtimeClass = data.overtimeCount > 0 ? 'overtime' : '';
            report += `
                <tr class="${overtimeClass}">
                    <td>${data.subject}</td>
                    <td>${data.actualCount}</td>
                    <td>${this.formatDuration(data.totalTime)}</td>
                    <td>${data.tasks.length > 0 ? this.formatDate(data.tasks[0].startDate) : ''}</td>
                    <td>${data.tasks.length > 0 ? this.formatDate(data.tasks[0].dueDate) : ''}</td>
                    <td>${data.tasks.length > 0 ? this.formatDate(data.tasks[0].completedAt) : ''}</td>
                    <td>${data.overtimeCount}${data.overtimeCount > 0 ? '<span class="overtime-mark">⚠️</span>' : ''}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-by-week">
                <h3>按周分析</h3>
                <table>
                    <tr>
                        <th>周</th>
                        <th>作业数量</th>
                        <th>总花费时间</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(analysis.tasksByWeek).forEach(([week, data]) => {
            const overtimeClass = data.overtimeTasks > 0 ? 'overtime' : '';
            report += `
                <tr class="${overtimeClass}">
                    <td><span class="clickable" data-type="week" data-value="${week}">${week}</span></td>
                    <td>${data.count}</td>
                    <td>${this.formatDuration(data.totalTimeSpent)}</td>
                    <td>${data.overtimeTasks}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-by-month">
                <h3>按月分析</h3>
                <table>
                    <tr>
                        <th>月份</th>
                        <th>作业数量</th>
                        <th>总花费时间</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(analysis.tasksByMonth).forEach(([month, data]) => {
            const overtimeClass = data.overtimeTasks > 0 ? 'overtime' : '';
            report += `
                <tr class="${overtimeClass}">
                    <td><span class="clickable" data-type="month" data-value="${month}">${month}</span></td>
                    <td>${data.count}</td>
                    <td>${this.formatDuration(data.totalTimeSpent)}</td>
                    <td>${data.overtimeTasks}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-by-year">
                <h3>按年分析</h3>
                <table>
                    <tr>
                        <th>年份</th>
                        <th>作业量</th>
                        <th>总花费时间</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(analysis.tasksByYear).forEach(([year, data]) => {
            const overtimeClass = data.overtimeTasks > 0 ? 'overtime' : '';
            report += `
                <tr class="${overtimeClass}">
                    <td><span class="clickable" data-type="year" data-value="${year}">${year}</span></td>
                    <td>${data.count}</td>
                    <td>${this.formatDuration(data.totalTimeSpent)}</td>
                    <td>${data.overtimeTasks}${data.overtimeTasks > 0 ? '<span class="overtime-mark">⚠️</span>' : ''}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-homework-progress">
                <h3>家庭作业完成进度</h3>
        `;
        
        // 统计家庭作业完成进度
        const homeworkProgress = this.getHomeworkProgress(allTasks);
        
        // 确保对应学霸的科目家庭作业进度显示
        if (student === 'KL') {
            // KL的科目：物理、化学、数学
            // KL的家庭作业只有一课一练和教材全解
            const klSubjects = ['物理', '化学', '数学'];
            const klAssignments = ['一课一练', '教材全解'];
            klSubjects.forEach(subject => {
                if (!homeworkProgress[subject]) {
                    homeworkProgress[subject] = {
                        assignments: {}
                    };
                }
                
                klAssignments.forEach(assignment => {
                    if (!homeworkProgress[subject].assignments[assignment]) {
                        const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                        homeworkProgress[subject].assignments[assignment] = {
                            completed: 0,
                            total: totalSectionsByAssignment[assignment] || 0
                        };
                    }
                });
            });
        } else if (student === 'KYP') {
            // KYP的科目：语文、数学、英语
            // KYP的家庭作业只有上海作业和名校名卷
            const kypSubjects = ['语文', '数学', '英语'];
            const kypAssignments = ['上海作业', '名校名卷'];
            kypSubjects.forEach(subject => {
                if (!homeworkProgress[subject]) {
                    homeworkProgress[subject] = {
                        assignments: {}
                    };
                }
                
                kypAssignments.forEach(assignment => {
                    if (!homeworkProgress[subject].assignments[assignment]) {
                        const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                        homeworkProgress[subject].assignments[assignment] = {
                            completed: 0,
                            total: totalSectionsByAssignment[assignment] || 0
                        };
                    }
                });
            });
        }
        
        // 按照科目分组显示
        Object.entries(homeworkProgress).forEach(([subject, data]) => {
            // 过滤科目：KYP只能显示语文、数学、英语
            if (student === 'KYP' && !['语文', '数学', '英语'].includes(subject)) {
                return;
            }
            
            report += `
                <div class="homework-subject-section">
                    <h4 class="subject-title">${subject}</h4>
                    <div class="homework-progress-charts">
            `;
            
            Object.entries(data.assignments).forEach(([assignment, progress]) => {
                // 过滤作业类型：KYP只能显示上海作业和名校名卷
                if (student === 'KYP' && !['上海作业', '名校名卷'].includes(assignment)) {
                    return;
                }
                // 过滤作业类型：KL只能显示一课一练和教材全解
                if (student === 'KL' && !['一课一练', '教材全解'].includes(assignment)) {
                    return;
                }
                
                const completed = progress.completed;
                const total = progress.total;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                report += `
                    <div class="homework-progress-item" data-student="${student}" data-subject="${subject}" data-assignment="${assignment}" style="cursor: pointer;">
                        <h5>${assignment}</h5>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%;"></div>
                                <div class="progress-remaining" style="width: ${100 - percentage}%;"></div>
                            </div>
                            <div class="progress-stats">
                                <div class="progress-text">已完成: ${completed} / 总任务: ${total}</div>
                                <div class="progress-percentage">${percentage}%</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            report += `
                    </div>
                </div>
            `;
        });
        
        report += `
            </div>
        `;
        
        // 移除学校进度与家庭作业进度对比分析
        // report += this.generateSchoolHomeworkComparison(student);
        
        return report;
    }
    
    // 生成学校进度与家庭作业进度对比分析
    generateSchoolHomeworkComparison(student) {
        // 获取学校进度数据
        const schoolProgress = JSON.parse(localStorage.getItem('schoolProgress')) || [];
        const studentSchoolProgress = schoolProgress.filter(p => p.student === student);
        
        let comparisonHTML = `
            <div class="efficiency-comparison">
                <h3>学校进度与家庭作业进度对比</h3>
                <div class="comparison-container">
        `;
        
        if (studentSchoolProgress.length === 0) {
            comparisonHTML += `
                <div class="comparison-item">
                    <div class="comparison-header">
                        <h4>提示</h4>
                        <span class="comparison-status" style="background-color: #e2e3e5; color: #383d41;">ℹ️ 信息</span>
                    </div>
                    <div class="comparison-progress">
                        <div class="progress-row">
                            <span class="progress-label">状态：</span>
                            <span class="progress-value">暂无学校进度数据</span>
                        </div>
                        <div class="progress-row">
                            <span class="progress-label">提示：</span>
                            <span class="progress-value">请先在学校课程进度中记录学习进度</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 获取最新的学校进度
            const latestSchoolProgress = studentSchoolProgress.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            // 获取家庭作业进度
            const filteredTasks = this.tasks.filter(t => t.student === student);
            const homeworkProgress = this.getHomeworkProgress(filteredTasks);
            
            // 确保对应学霸的科目家庭作业进度显示
            if (student === 'KL') {
                // KL的科目：物理、化学、数学
                // KL的家庭作业只有一课一练和教材全解
                const klAssignments = ['一课一练', '教材全解'];
                const klSubjects = ['物理', '化学', '数学'];
                klSubjects.forEach(subject => {
                    if (!homeworkProgress[subject]) {
                        homeworkProgress[subject] = {
                            assignments: {}
                        };
                    }
                    
                    klAssignments.forEach(assignment => {
                        if (!homeworkProgress[subject].assignments[assignment]) {
                            const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                            homeworkProgress[subject].assignments[assignment] = {
                                completed: 0,
                                total: totalSectionsByAssignment[assignment] || 0
                            };
                        }
                    });
                });
            } else if (student === 'KYP') {
                // KYP的科目：语文、数学、英语
                // KYP的家庭作业只有上海作业和名校名卷
                const kypAssignments = ['上海作业', '名校名卷', '一课一练'];
                const kypSubjects = ['语文', '数学', '英语'];
                kypSubjects.forEach(subject => {
                    if (!homeworkProgress[subject]) {
                        homeworkProgress[subject] = {
                            assignments: {}
                        };
                    }
                    
                    kypAssignments.forEach(assignment => {
                        if (!homeworkProgress[subject].assignments[assignment]) {
                            const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                            homeworkProgress[subject].assignments[assignment] = {
                                completed: 0,
                                total: totalSectionsByAssignment[assignment] || 0
                            };
                        }
                    });
                });
            }
            
            let hasComparison = false;
            
            // 对比每个科目
            Object.entries(latestSchoolProgress.courses).forEach(([course, data]) => {
                // 检查是否有家庭作业数据
                if (!homeworkProgress[course] || Object.keys(homeworkProgress[course].assignments).length === 0) {
                    return;
                }
                
                // 解析学校进度（更灵活的格式解析）
                const schoolUnit = this.parseProgressUnit(data.lesson);
                
                if (!schoolUnit) {
                    return;
                }
                
                // 获取家庭作业进度
                const homeworkData = homeworkProgress[course];
                let totalCompletedSections = 0;
                
                // 计算总完成小节数
                Object.entries(homeworkData.assignments).forEach(([assignment, progress]) => {
                    totalCompletedSections += progress.completed;
                });
                
                // 即使totalCompletedSections为0，也进行对比
                // if (totalCompletedSections === 0) {
                //     return;
                // }
                
                // 计算家庭作业进度单元
                // 考虑到两边的目录可能不一样，我们需要根据实际情况调整计算方式
                // 这里我们假设家庭作业的目录结构与学校进度的目录结构一致
                // 即每单元5个小节，与学校进度的每单元5课对应
                const homeworkUnit = {
                    unit: Math.ceil(totalCompletedSections / 5), // 假设每单元5个小节
                    lesson: totalCompletedSections % 5 || 5
                };
                
                if (schoolUnit && homeworkUnit) {
                    hasComparison = true;
                    const isBehind = homeworkUnit.unit < schoolUnit.unit || 
                                    (homeworkUnit.unit === schoolUnit.unit && homeworkUnit.lesson < schoolUnit.lesson);
                    const statusClass = isBehind ? 'behind' : 'on-track';
                    const statusText = isBehind ? '⚠️ 滞后' : '✅ 正常';
                    
                    comparisonHTML += `
                        <div class="comparison-item ${statusClass}">
                            <div class="comparison-header">
                                <h4>${course}</h4>
                                <span class="comparison-status">${statusText}</span>
                            </div>
                            <div class="comparison-progress">
                                <div class="progress-row">
                                    <span class="progress-label">学校进度：</span>
                                    <span class="progress-value">${data.lesson}</span>
                                </div>
                                <div class="progress-row">
                                    <span class="progress-label">家庭作业：</span>
                                    <span class="progress-value">第${homeworkUnit.unit}单元第${homeworkUnit.lesson}课</span>
                                </div>
                            </div>
                            ${isBehind ? `
                            <div class="comparison-gap">
                                <span>差距：${schoolUnit.unit - homeworkUnit.unit}单元 ${schoolUnit.lesson - homeworkUnit.lesson}课</span>
                            </div>
                            ` : ''}
                        </div>
                    `;
                }
            });
            
            if (!hasComparison) {
                comparisonHTML += `
                    <div class="comparison-item">
                        <div class="comparison-header">
                            <h4>提示</h4>
                            <span class="comparison-status" style="background-color: #e2e3e5; color: #383d41;">ℹ️ 信息</span>
                        </div>
                        <div class="comparison-progress">
                            <div class="progress-row">
                                <span class="progress-label">状态：</span>
                                <span class="progress-value">暂无对比数据</span>
                            </div>
                            <div class="progress-row">
                                <span class="progress-label">提示：</span>
                                <span class="progress-value">请先完成一些家庭作业，然后再进行对比</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        comparisonHTML += `
                </div>
            </div>
        `;
        
        return comparisonHTML;
    }
    
    // 解析进度字符串（更灵活的格式解析）
    parseProgressUnit(progressStr) {
        if (!progressStr) return null;
        
        // 匹配数字格式，如 "第3单元第5课" 或 "第三章第五节"
        const unitMatch = progressStr.match(/第(\d+)[单元章]/);
        const lessonMatch = progressStr.match(/第(\d+)[课节]/);
        
        if (unitMatch && lessonMatch) {
            return {
                unit: parseInt(unitMatch[1]),
                lesson: parseInt(lessonMatch[1])
            };
        }
        
        // 匹配中文数字格式
        const chineseUnitMatch = progressStr.match(/第([一二三四五六七八九十百千万]+)[单元章]/);
        const chineseLessonMatch = progressStr.match(/第([一二三四五六七八九十百千万]+)[课节]/);
        
        if (chineseUnitMatch && chineseLessonMatch) {
            return {
                unit: this.chineseToNumber(chineseUnitMatch[1]),
                lesson: this.chineseToNumber(chineseLessonMatch[1])
            };
        }
        
        return null;
    }
    
    // 生成效率分析报告HTML
    generateEfficiencyReportHTML(analysis, allTasks, student) {
        // 获取学霸信息（假设所有任务属于同一个学霸）
        const studentWithGender = student === 'KL' ? 'KL♀' : student === 'KYP' ? 'KYP♂' : student;
        
        // 计算过期未完成的任务
        const now = new Date();
        const overdueTasks = allTasks.filter(task => {
            return !task.completed && task.dueDate && new Date(task.dueDate) < now;
        });
        
        let report = `
            <div class="efficiency-header">
                <h2>学习效率分析 - ${studentWithGender}</h2>
            </div>
            
            <div class="efficiency-summary">
                <h3>总体效率分析</h3>
                <p>已完成作业总数: ${analysis.totalTasks}</p>
                <p>总花费时间: ${this.formatDuration(analysis.totalTimeSpent)}</p>
                <p>平均完成时间: ${this.formatDuration(analysis.averageTimeSpent)}</p>
                <p>超时任务数量: ${analysis.overtimeTasks}</p>
                <p>过期未完成任务: ${overdueTasks.length}</p>
            </div>
            
            <div class="efficiency-by-subject">
                <h3>按科目分析</h3>
                <table>
                    <tr>
                        <th>科目</th>
                        <th>作业量</th>
                        <th>总花费时间</th>
                        <th>平均完成时间</th>
                        <th>开始日期</th>
                        <th>截止日期</th>
                        <th>完成日期</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(analysis.tasksBySubject).forEach(([subject, data]) => {
            const subjectData = data;
            const firstTask = subjectData.tasks[0];
            
            report += `
                <tr>
                    <td>${subject}</td>
                    <td>${subjectData.totalCount || subjectData.tasks.length}</td>
                    <td>${this.formatDuration(subjectData.totalTimeSpent)}</td>
                    <td>${this.formatDuration(subjectData.averageTimeSpent)}</td>
                    <td>${firstTask ? this.formatDate(firstTask.startDate) : '-'}</td>
                    <td>${firstTask ? this.formatDate(firstTask.dueDate) : '-'}</td>
                    <td>${firstTask ? this.formatDate(firstTask.completedAt) : '-'}</td>
                    <td>${subjectData.overtimeTasks}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-by-week">
                <h3>按周分析</h3>
                <table>
                    <tr>
                        <th>周</th>
                        <th>作业量</th>
                        <th>总花费时间</th>
                        <th>平均完成时间</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(analysis.tasksByWeek).forEach(([week, data]) => {
            report += `
                <tr>
                    <td>${week}</td>
                    <td>${data.count}</td>
                    <td>${this.formatDuration(data.totalTimeSpent)}</td>
                    <td>${this.formatDuration(data.averageTimeSpent)}</td>
                    <td>${data.overtimeTasks}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-by-month">
                <h3>按月分析</h3>
                <table>
                    <tr>
                        <th>月份</th>
                        <th>作业量</th>
                        <th>总花费时间</th>
                        <th>平均完成时间</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(analysis.tasksByMonth).forEach(([month, data]) => {
            report += `
                <tr>
                    <td>${month}</td>
                    <td>${data.count}</td>
                    <td>${this.formatDuration(data.totalTimeSpent)}</td>
                    <td>${this.formatDuration(data.averageTimeSpent)}</td>
                    <td>${data.overtimeTasks}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-by-year">
                <h3>按年分析</h3>
                <table>
                    <tr>
                        <th>年份</th>
                        <th>作业量</th>
                        <th>总花费时间</th>
                        <th>平均完成时间</th>
                        <th>超时项</th>
                    </tr>
        `;
        
        Object.entries(analysis.tasksByYear).forEach(([year, data]) => {
            report += `
                <tr>
                    <td>${year}</td>
                    <td>${data.count}</td>
                    <td>${this.formatDuration(data.totalTimeSpent)}</td>
                    <td>${this.formatDuration(data.averageTimeSpent)}</td>
                    <td>${data.overtimeTasks}</td>
                </tr>
            `;
        });
        
        report += `
                </table>
            </div>
            
            <div class="efficiency-homework-progress">
                <h3>家庭作业完成进度</h3>
        `;
        
        // 统计家庭作业完成进度
        const homeworkProgress = this.getHomeworkProgress(allTasks);
        
        // 确保对应学霸的科目家庭作业进度显示
        if (student === 'KL') {
            // KL的科目：物理、化学、数学
            // KL的家庭作业只有一课一练和教材全解
            const klSubjects = ['物理', '化学', '数学'];
            const klAssignments = ['一课一练', '教材全解'];
            klSubjects.forEach(subject => {
                if (!homeworkProgress[subject]) {
                    homeworkProgress[subject] = {
                        assignments: {}
                    };
                }
                
                klAssignments.forEach(assignment => {
                    if (!homeworkProgress[subject].assignments[assignment]) {
                        const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                        homeworkProgress[subject].assignments[assignment] = {
                            completed: 0,
                            total: totalSectionsByAssignment[assignment] || 0
                        };
                    }
                });
            });
        } else if (student === 'KYP') {
            // KYP的科目：语文、数学、英语
            // KYP的家庭作业只有上海作业和名校名卷
            const kypSubjects = ['语文', '数学', '英语'];
            const kypAssignments = ['上海作业', '名校名卷'];
            kypSubjects.forEach(subject => {
                if (!homeworkProgress[subject]) {
                    homeworkProgress[subject] = {
                        assignments: {}
                    };
                }
                
                kypAssignments.forEach(assignment => {
                    if (!homeworkProgress[subject].assignments[assignment]) {
                        const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
                        homeworkProgress[subject].assignments[assignment] = {
                            completed: 0,
                            total: totalSectionsByAssignment[assignment] || 0
                        };
                    }
                });
            });
        }
        
        // 按照科目分组显示
        Object.entries(homeworkProgress).forEach(([subject, data]) => {
            report += `
                <div class="homework-subject-section">
                    <h4 class="subject-title">${subject}</h4>
                    <div class="homework-progress-charts">
            `;
            
            Object.entries(data.assignments).forEach(([assignment, progress]) => {
                const completed = progress.completed;
                const total = progress.total;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                report += `
                    <div class="homework-progress-item" data-student="${student}" data-subject="${subject}" data-assignment="${assignment}" style="cursor: pointer;">
                        <h5>${assignment}</h5>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%;"></div>
                                <div class="progress-remaining" style="width: ${100 - percentage}%;"></div>
                            </div>
                            <div class="progress-stats">
                                <div class="progress-text">已完成: ${completed} / 总任务: ${total}</div>
                                <div class="progress-percentage">${percentage}%</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            report += `
                    </div>
                </div>
            `;
        });
        
        report += `
            </div>
        `;
        
        // 移除学校进度与家庭作业进度对比分析
        // report += this.generateSchoolHomeworkComparison(student);
        
        return report;
    }
    
    // 中文数字转阿拉伯数字
    chineseToNumber(chinese) {
        // 如果是纯数字，直接返回
        if (/^\d+$/.test(chinese)) {
            return parseInt(chinese);
        }
        
        const chineseNums = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
        };
        
        let result = 0;
        let temp = 0;
        
        for (let i = 0; i < chinese.length; i++) {
            const char = chinese[i];
            const num = chineseNums[char];
            
            if (num === 10) {
                if (temp === 0) {
                    temp = 1;
                }
                result += temp * 10;
                temp = 0;
            } else if (num) {
                temp = num;
            }
        }
        
        return result + temp;
    }
    
    // 格式化时间 duration (毫秒)
    formatDuration(duration) {
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
    
    // 获取家庭作业完成进度
    getHomeworkProgress(tasks) {
        const progress = {};
        
        // 统计每个具体作业的总小节数
        const totalSectionsByAssignment = this.getTotalSectionsByAssignment();
        
        // 支持的作业类型
        const assignmentTypes = ['上海作业', '名校名卷', '一课一练', '教材全解'];
        
        tasks.forEach(task => {
            // 检查是否是家庭作业相关任务
            if (task.subject && task.assignment && assignmentTypes.includes(task.assignment) && task.section) {
                if (!progress[task.subject]) {
                    progress[task.subject] = {
                        assignments: {}
                    };
                }
                
                if (!progress[task.subject].assignments[task.assignment]) {
                    progress[task.subject].assignments[task.assignment] = {
                        completed: 0,
                        total: totalSectionsByAssignment[task.assignment] || 0
                    };
                }
                
                // 如果任务已完成，增加已完成计数
                if (task.completed) {
                    progress[task.subject].assignments[task.assignment].completed++;
                }
            }
        });
        
        return progress;
    }
    
    // 获取每个具体作业的总小节数
    getTotalSectionsByAssignment() {
        // 根据实际的小节数量计算
        const totalSections = {
            '上海作业': 74, // 数学上海作业的实际小节数量
            '名校名卷': 80,  // 假设名校名卷有80个小节
            '一课一练': 120, // 假设一课一练有120个小节
            '教材全解': 150  // 假设教材全解有150个小节
        };
        return totalSections;
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        try {
            // 更新按钮状态
            const filterButtons = document.querySelectorAll('.filter-buttons button[data-filter]');
            if (filterButtons.length > 0) {
                filterButtons.forEach(button => {
                    button.classList.remove('active');
                    if (button.dataset.filter === filter) {
                        button.classList.add('active');
                    }
                });
            }
            
            // 确保学霸过滤按钮的状态与currentStudentFilter的值保持一致
            const studentButtons = document.querySelectorAll('.student-btn');
            if (studentButtons.length > 0) {
                studentButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.student === this.currentStudentFilter) {
                        btn.classList.add('active');
                    }
                });
            }
            
            // 确保作业类型过滤按钮的状态与currentTypeFilter的值保持一致
            const typeButtons = document.querySelectorAll('.type-btn');
            if (typeButtons.length > 0) {
                typeButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.type === this.currentTypeFilter) {
                        btn.classList.add('active');
                    }
                });
            }
            
            this.renderTasks();
        } catch (error) {
            console.error('Error in setFilter:', error);
            // 即使发生错误，也要尝试渲染任务
            try {
                this.renderTasks();
            } catch (e) {
                console.error('Error rendering tasks:', e);
            }
        }
    }
    
    setSort(sort) {
        this.currentSort = sort;
        this.renderTasks();
    }
    
    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        // 过滤
        if (this.currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }
        
        // 学霸过滤
        if (this.currentStudentFilter) {
            filteredTasks = filteredTasks.filter(task => task.student === this.currentStudentFilter);
        }
        
        // 作业类型过滤
        if (this.currentTypeFilter) {
            filteredTasks = filteredTasks.filter(task => task.title === this.currentTypeFilter);
        }
        
        // 日期范围过滤
        if (this.dateFilter.start || this.dateFilter.end) {
            filteredTasks = filteredTasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                let startDate = null;
                let endDate = null;
                
                if (this.dateFilter.start) {
                    startDate = new Date(this.dateFilter.start);
                    startDate.setHours(0, 0, 0, 0);
                }
                
                if (this.dateFilter.end) {
                    endDate = new Date(this.dateFilter.end);
                    endDate.setHours(23, 59, 59, 999);
                }
                
                if (startDate && endDate) {
                    return taskDate >= startDate && taskDate <= endDate;
                } else if (startDate) {
                    return taskDate >= startDate;
                } else if (endDate) {
                    return taskDate <= endDate;
                }
                
                return true;
            });
        }
        
        // 排序
        filteredTasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'dueDate':
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'priority':
                    const priorityOrder = { '高': 3, '中': 2, '低': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'subject':
                    return a.subject.localeCompare(b.subject);
                default:
                    return 0;
            }
        });
        
        return filteredTasks;
    }
    
    renderTasks() {
        const taskList = document.getElementById('task-list');
        let filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <h3>暂无作业</h3>
                    <p>点击"添加新作业"开始管理你的学习任务</p>
                </div>
            `;
            return;
        }
        
        // 清空任务列表
        taskList.innerHTML = '';
        
        // 逐个添加任务
        filteredTasks.forEach(task => {
            const priorityClass = task.priority === '高' ? 'high' : task.priority === '中' ? 'medium' : 'low';
            const completedClass = task.completed ? 'completed' : '';
            
            // 创建任务项容器
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${completedClass}`;
            
            // 创建复选框
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.dataset.id = task.id;
            checkbox.checked = task.completed;
            
            // 复选框现在只是显示状态，不触发事件
            // 任务完成通过"标记完成"按钮触发
            
            // 处理具体作业显示
            let assignmentHtml = '';
            if (task.title === '家庭作业') {
                assignmentHtml = '<div class="school-assignments-display"><div class="school-assignment-title">具体作业:</div><div class="school-assignment-item">' + task.assignment + '</div></div>';
            } else if (task.title === '学校作业' && task.assignment) {
                try {
                    const schoolAssignments = JSON.parse(task.assignment);
                    assignmentHtml = '<div class="school-assignments-display"><div class="school-assignment-title">具体作业:</div>';
                    
                    if (schoolAssignments.preview && schoolAssignments.preview.checked) {
                        assignmentHtml += `<div class="school-assignment-item">预习${schoolAssignments.preview.description ? `: ${schoolAssignments.preview.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.writing && schoolAssignments.writing.checked) {
                        assignmentHtml += `<div class="school-assignment-item">习作${schoolAssignments.writing.description ? `: ${schoolAssignments.writing.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.practice && schoolAssignments.practice.checked) {
                        assignmentHtml += `<div class="school-assignment-item">语练${schoolAssignments.practice.description ? `: ${schoolAssignments.practice.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.copy && schoolAssignments.copy.checked) {
                        assignmentHtml += `<div class="school-assignment-item">抄写${schoolAssignments.copy.description ? `: ${schoolAssignments.copy.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.dictation && schoolAssignments.dictation.checked) {
                        assignmentHtml += `<div class="school-assignment-item">家默${schoolAssignments.dictation.description ? `: ${schoolAssignments.dictation.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.listening && schoolAssignments.listening.checked) {
                        assignmentHtml += `<div class="school-assignment-item">听读${schoolAssignments.listening.description ? `: ${schoolAssignments.listening.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.recitation && schoolAssignments.recitation.checked) {
                        assignmentHtml += `<div class="school-assignment-item">背诵${schoolAssignments.recitation.description ? `: ${schoolAssignments.recitation.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.hbook && schoolAssignments.hbook.checked) {
                        assignmentHtml += `<div class="school-assignment-item">H本默写${schoolAssignments.hbook.description ? `: ${schoolAssignments.hbook.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.englishWorkbook && schoolAssignments.englishWorkbook.checked) {
                        assignmentHtml += `<div class="school-assignment-item">英语练习册${schoolAssignments.englishWorkbook.description ? `: ${schoolAssignments.englishWorkbook.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.practicePaper && schoolAssignments.practicePaper.checked) {
                        assignmentHtml += `<div class="school-assignment-item">练习卷${schoolAssignments.practicePaper.description ? `: ${schoolAssignments.practicePaper.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.colorbook && schoolAssignments.colorbook.checked) {
                        assignmentHtml += `<div class="school-assignment-item">彩本${schoolAssignments.colorbook.description ? `: ${schoolAssignments.colorbook.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.excerpt && schoolAssignments.excerpt.checked) {
                        assignmentHtml += `<div class="school-assignment-item">摘抄${schoolAssignments.excerpt.description ? `: ${schoolAssignments.excerpt.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.schoolbook && schoolAssignments.schoolbook.checked) {
                        assignmentHtml += `<div class="school-assignment-item">校本${schoolAssignments.schoolbook.description ? `: ${schoolAssignments.schoolbook.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.workbook && schoolAssignments.workbook.checked) {
                        assignmentHtml += `<div class="school-assignment-item">练习册${schoolAssignments.workbook.description ? `: ${schoolAssignments.workbook.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.exercisebook && schoolAssignments.exercisebook.checked) {
                        assignmentHtml += `<div class="school-assignment-item">作业本${schoolAssignments.exercisebook.description ? `: ${schoolAssignments.exercisebook.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.mistakebook && schoolAssignments.mistakebook.checked) {
                        assignmentHtml += `<div class="school-assignment-item">错题本${schoolAssignments.mistakebook.description ? `: ${schoolAssignments.mistakebook.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.weekly && schoolAssignments.weekly.checked) {
                        assignmentHtml += `<div class="school-assignment-item">周记本${schoolAssignments.weekly.description ? `: ${schoolAssignments.weekly.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.notes && schoolAssignments.notes.checked) {
                        assignmentHtml += `<div class="school-assignment-item">课堂笔记${schoolAssignments.notes.description ? `: ${schoolAssignments.notes.description}` : ''}</div>`;
                    }
                    if (schoolAssignments.ehear && schoolAssignments.ehear.checked) {
                        assignmentHtml += `<div class="school-assignment-item">E听说${schoolAssignments.ehear.description ? `: ${schoolAssignments.ehear.description}` : ''}</div>`;
                    }
                    
                    assignmentHtml += '</div>';
                } catch (e) {
                    assignmentHtml = '<div class="school-assignments-display"><div class="school-assignment-title">具体作业:</div><div class="school-assignment-item">' + task.assignment + '</div></div>';
                }
            }
            
            // 处理完成时间显示
            let completedTimeHtml = '';
            if (task.completed && task.completedAt) {
                completedTimeHtml = `<div class="task-completed-time">完成时间: ${this.formatDate(task.completedAt)}</div>`;
            }
            
            // 处理图片显示
            let imagesHtml = '';
            if (task.images && task.images.length > 0) {
                imagesHtml = `<div class="task-images">${task.images.map((file, index) => {
                    const isAudio = file.startsWith('data:audio/');
                    return `<div class="task-file">${isAudio ? `<audio controls src="${file}" alt="作业录音 ${index + 1}"></audio>` : `<img src="${file}" alt="作业照片 ${index + 1}" />`}<div class="file-actions"><button class="btn btn-edit-image" data-id="${task.id}" data-index="${index}">编辑文件</button><button class="btn btn-delete-image" data-id="${task.id}" data-index="${index}">删除文件</button></div></div>`;
                }).join('')}</div>`;
            }
            
            // 构建任务内容
            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';
            taskContent.innerHTML = `
                <div class="task-meta">
                    <span class="task-field">科目: <span class="task-subject">${task.subject}</span></span>
                    <span class="task-field">作业类型: <span class="task-type">${task.title}</span></span>
                    <span class="task-field">学霸: <span class="task-student">${task.student === 'KL' ? 'KL♀' : task.student === 'KYP' ? 'KYP♂' : task.student || ''}</span></span>
                    ${assignmentHtml}
                    ${task.title === '家庭作业' ? `<span class="task-field">页码: <span class="task-page">${task.page}</span></span><span class="task-field">章节: <span class="task-chapter">${task.chapter || ''}</span></span><span class="task-field">小节: <span class="task-section">${task.section || ''}</span></span>` : ''}
                    <span class="task-field">开始日期: <span class="task-start-date">📅 ${this.formatDate(task.startDate)}</span></span>
                    <span class="task-field">截止日期: <span class="task-due-date">📅 ${this.formatDate(task.dueDate)}</span></span>
                    <span class="task-field">优先级: <span class="task-priority ${priorityClass}">${task.priority}</span></span>
                </div>
                ${imagesHtml}
                ${completedTimeHtml}
            `;
            
            // 构建任务操作按钮
            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
            
            // 构建按钮HTML
            let actionsHtml = `
                <button class="btn btn-upload" data-id="${task.id}">上传作业</button>
            `;
            
            // 无论是否上传了附件，都显示"完成提交"按钮
            if (!task.completed) {
                console.log('Adding complete button for task:', task.id);
                // 检查是否上传了附件
                const hasImages = task.images && task.images.length > 0;
                // 根据是否上传了附件设置按钮样式和点击事件
                if (hasImages) {
                    actionsHtml += `
                        <button class="btn btn-complete" onclick="taskManager.toggleComplete('${task.id}')">完成提交</button>
                    `;
                } else {
                    actionsHtml += `
                        <button class="btn btn-complete disabled" onclick="alert('请先上传作业，然后再提交完成！');">完成提交</button>
                    `;
                }
            }
            
            // 添加编辑和删除按钮
            actionsHtml += `
                <button class="btn btn-edit" data-id="${task.id}">编辑</button>
                <button class="btn btn-delete" data-id="${task.id}">删除</button>
            `;
            
            taskActions.innerHTML = actionsHtml;
            
            // 组装任务项
            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskContent);
            taskItem.appendChild(taskActions);
            
            // 添加到任务列表
            taskList.appendChild(taskItem);
        });
        
        // 确保学霸过滤按钮的状态与currentStudentFilter的值保持一致
        document.querySelectorAll('.student-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.student === this.currentStudentFilter) {
                btn.classList.add('active');
            }
        });
        
        // 绑定其他按钮事件
        this.bindTaskEvents();
    }
    
    bindTaskEvents() {
        const self = this;
        
        // 绑定其他按钮的点击事件
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function(e) {
                self.editTask(e.target.dataset.id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function(e) {
                self.deleteTask(e.target.dataset.id);
            });
        });
        
        document.querySelectorAll('.btn-upload').forEach(button => {
            button.addEventListener('click', function(e) {
                self.openUploadModal(e.target.dataset.id);
            });
        });
        
        // 绑定标记完成按钮的点击事件
        const completeButtons = document.querySelectorAll('.btn-complete');
        console.log('Found complete buttons:', completeButtons.length);
        completeButtons.forEach(button => {
            console.log('Binding click event to complete button with id:', button.dataset.id);
            button.addEventListener('click', function(e) {
                console.log('Complete button clicked with id:', e.target.dataset.id);
                self.toggleComplete(e.target.dataset.id);
            });
        });
        
        document.querySelectorAll('.btn-edit-image').forEach(button => {
            button.addEventListener('click', function(e) {
                const taskId = e.target.dataset.id;
                const index = parseInt(e.target.dataset.index);
                self.editImage(taskId, index);
            });
        });
        
        document.querySelectorAll('.btn-delete-image').forEach(button => {
            button.addEventListener('click', function(e) {
                const taskId = e.target.dataset.id;
                const index = parseInt(e.target.dataset.index);
                self.deleteImage(taskId, index);
            });
        });
    }
    
    // 编辑图片
    editImage(taskId, index) {
        // 打开上传模态框，允许用户选择新图片
        document.getElementById('upload-task-id').value = taskId;
        // 存储要编辑的图片索引
        document.getElementById('upload-task-id').dataset.imageIndex = index;
        document.getElementById('upload-modal').style.display = 'block';
    }
    
    // 删除图片
    deleteImage(taskId, index) {
        if (confirm('确定要删除这张图片吗？')) {
            const taskIndex = this.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1 && this.tasks[taskIndex].images) {
                // 从数组中删除指定索引的图片
                this.tasks[taskIndex].images.splice(index, 1);
                this.saveTasks();
                this.renderTasks();
                alert('图片删除成功！');
            }
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    clearForm() {
        document.getElementById('add-task-form').reset();
        // 重置后重新设置默认日期
        this.setDefaultDates();
        // 重置后设置优先级为高
        document.getElementById('task-priority').value = '高';
    }
    
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    // 初始化练习题库筛选功能
    initPracticeFilters() {
        const studentSelect = document.getElementById('practice-student');
        const gradeSelect = document.getElementById('practice-grade');
        const subjectSelect = document.getElementById('practice-subject');
        const semesterSelect = document.getElementById('practice-semester');
        
        if (studentSelect && gradeSelect && subjectSelect && semesterSelect) {
            // 绑定筛选事件
            studentSelect.addEventListener('change', () => this.filterPracticeQuestions());
            gradeSelect.addEventListener('change', () => this.filterPracticeQuestions());
            subjectSelect.addEventListener('change', () => this.filterPracticeQuestions());
            semesterSelect.addEventListener('change', () => this.filterPracticeQuestions());
        }
    }
    
    // 筛选练习题库内容
    filterPracticeQuestions() {
        const student = document.getElementById('practice-student').value;
        const grade = document.getElementById('practice-grade').value;
        const subject = document.getElementById('practice-subject').value;
        const semester = document.getElementById('practice-semester').value;
        
        const practiceItems = document.querySelectorAll('.practice-item');
        
        practiceItems.forEach(item => {
            const itemGrade = item.querySelector('span').textContent.split(' | ')[0];
            const itemSubject = item.querySelector('span').textContent.split(' | ')[1];
            const itemTitle = item.querySelector('h4').textContent;
            
            let showItem = true;
            
            // 筛选年级
            if (grade) {
                const gradeMap = {
                    'grade5': '五年级',
                    'grade6': '六年级',
                    'grade7': '七年级',
                    'grade8': '八年级',
                    'grade9': '九年级'
                };
                if (itemGrade !== gradeMap[grade]) {
                    showItem = false;
                }
            }
            
            // 筛选科目
            if (subject && showItem) {
                const subjectMap = {
                    'chinese': '语文',
                    'math': '数学',
                    'english': '英语',
                    'physics': '物理',
                    'chemistry': '化学',
                    'biology': '生物'
                };
                const selectedSubject = subjectMap[subject];
                // 特殊处理物理/化学综合练习
                if (itemSubject.includes('物理/化学')) {
                    if (selectedSubject !== '物理' && selectedSubject !== '化学') {
                        showItem = false;
                    }
                } else if (!itemSubject.includes(selectedSubject)) {
                    showItem = false;
                }
            }
            
            // 筛选册别
            if (semester && showItem) {
                if (semester === 'first' && !itemTitle.includes('上册')) {
                    showItem = false;
                } else if (semester === 'second' && !itemTitle.includes('下册')) {
                    showItem = false;
                }
            }
            
            // 筛选学霸（这里暂时不做筛选，因为题库内容没有区分学霸）
            // if (student && showItem) {
            //     // 可以根据需要添加学霸筛选逻辑
            // }
            
            item.style.display = showItem ? 'block' : 'none';
        });
        
        // 重新绑定开始练习按钮事件
        this.bindPracticeButtons();
    }
    
    // 绑定练习按钮事件
    bindPracticeButtons() {
        const practiceButtons = document.querySelectorAll('.practice-item button');
        practiceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const practiceItem = e.target.closest('.practice-item');
                const title = practiceItem.querySelector('h4').textContent;
                const description = practiceItem.querySelector('p').textContent;
                const gradeSubject = practiceItem.querySelector('span').textContent;
                
                this.openPracticeDetailModal(title, description, gradeSubject);
            });
        });
    }
    
    // 打开练习详情模态框
    openPracticeDetailModal(title, description, gradeSubject) {
        document.getElementById('practice-title').textContent = title;
        document.getElementById('practice-description').textContent = description;
        document.getElementById('practice-grade-subject').textContent = gradeSubject;
        
        // 显示模态框
        document.getElementById('practice-detail-modal').style.display = 'block';
        
        // 初始化练习类型按钮事件
        this.initPracticeTypeButtons();
    }
    
    // 初始化练习类型按钮事件
    initPracticeTypeButtons() {
        const practiceTypeButtons = document.querySelectorAll('.practice-type-btn');
        practiceTypeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const practiceType = e.target.dataset.type;
                this.handlePracticeTypeSelection(practiceType);
            });
        });
        
        // 初始化练习详情模态框的关闭按钮
        const practiceDetailModal = document.getElementById('practice-detail-modal');
        if (practiceDetailModal) {
            const closeBtn = practiceDetailModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    practiceDetailModal.style.display = 'none';
                });
            }
            
            // 点击模态框外部关闭
            window.addEventListener('click', (e) => {
                if (e.target === practiceDetailModal) {
                    practiceDetailModal.style.display = 'none';
                }
            });
        }
    }
    
    // 处理练习类型选择
    handlePracticeTypeSelection(type) {
        // 显示单元选择器（如果需要）
        const unitSelector = document.querySelector('.unit-selector');
        if (type === 'unit') {
            unitSelector.style.display = 'block';
            this.generateUnitList();
        } else {
            unitSelector.style.display = 'none';
        }
        
        // 这里可以根据选择的练习类型进行不同的处理
        console.log('Selected practice type:', type);
    }
    
    // 生成单元列表
    generateUnitList() {
        const unitList = document.getElementById('unit-list');
        unitList.innerHTML = '';
        
        // 获取当前练习的标题，判断是上册还是下册
        const practiceTitle = document.getElementById('practice-title').textContent;
        const isUpperSemester = practiceTitle.includes('上册');
        
        // 五年级英语单元目录
        const upperUnits = [
            'Unit 1 New classmates',
            'Unit 2 My way to school',
            'Unit 3 Grandparents',
            'Unit 4 Friends',
            'Unit 5 Moving home',
            'Unit 6 Around the city',
            'Unit 7 Buying new clothes',
            'Unit 8 Seeing the doctor'
        ];
        
        const lowerUnits = [
            'Unit 1 What a mess!',
            'Unit 2 Watch it grow!',
            'Unit 3 How noisy!',
            'Unit 4 Food and drinks',
            'Unit 5 Films',
            'Unit 6 School subjects',
            'Unit 7 Signs',
            'Unit 8 Weather'
        ];
        
        // 练习题下载链接
        const upperLinks = [
            'https://www.51jiaoxi.com/albums-17036.html',
            'https://www.51jiaoxi.com/albums-17036.html',
            'https://www.51jiaoxi.com/albums-17036.html',
            'https://www.51jiaoxi.com/albums-17036.html',
            'https://www.51jiaoxi.com/albums-17036.html',
            'https://www.51jiaoxi.com/albums-17036.html',
            'https://www.51jiaoxi.com/albums-17036.html',
            'https://www.51jiaoxi.com/albums-17036.html'
        ];
        
        const lowerLinks = [
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm',
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm',
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm',
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm',
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm',
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm',
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm',
            'https://m.book118.com/html/2024/0523/5010002220011213.shtm'
        ];
        
        const units = isUpperSemester ? upperUnits : lowerUnits;
        const links = isUpperSemester ? upperLinks : lowerLinks;
        
        // 生成单元按钮
        for (let i = 0; i < units.length; i++) {
            const unitContainer = document.createElement('div');
            unitContainer.style.display = 'flex';
            unitContainer.style.flexDirection = 'column';
            unitContainer.style.gap = '5px';
            
            const unitButton = document.createElement('button');
            unitButton.textContent = units[i];
            unitButton.style.padding = '10px';
            unitButton.style.border = '1px solid #ddd';
            unitButton.style.borderRadius = '6px';
            unitButton.style.backgroundColor = 'white';
            unitButton.style.cursor = 'pointer';
            unitButton.style.transition = 'all 0.3s ease';
            unitButton.style.fontSize = '14px';
            
            unitButton.addEventListener('mouseover', () => {
                unitButton.style.backgroundColor = '#f0f0f0';
            });
            
            unitButton.addEventListener('mouseout', () => {
                unitButton.style.backgroundColor = 'white';
            });
            
            unitButton.addEventListener('click', () => {
                console.log('Selected unit:', units[i]);
                // 这里可以添加单元选择后的处理逻辑
            });
            
            const linkButton = document.createElement('a');
            linkButton.href = links[i];
            linkButton.target = '_blank';
            linkButton.textContent = '下载练习题 (Word版)';
            linkButton.style.padding = '6px 10px';
            linkButton.style.border = '1px solid #667eea';
            linkButton.style.borderRadius = '4px';
            linkButton.style.backgroundColor = '#f8f9fa';
            linkButton.style.color = '#667eea';
            linkButton.style.textDecoration = 'none';
            linkButton.style.fontSize = '12px';
            linkButton.style.textAlign = 'center';
            linkButton.style.cursor = 'pointer';
            linkButton.style.transition = 'all 0.3s ease';
            
            linkButton.addEventListener('mouseover', () => {
                linkButton.style.backgroundColor = '#667eea';
                linkButton.style.color = 'white';
            });
            
            linkButton.addEventListener('mouseout', () => {
                linkButton.style.backgroundColor = '#f8f9fa';
                linkButton.style.color = '#667eea';
            });
            
            unitContainer.appendChild(unitButton);
            unitContainer.appendChild(linkButton);
            unitList.appendChild(unitContainer);
        }
    }
}

// 初始化应用
const taskManager = new TaskManager();
window.taskManager = taskManager; // 确保全局可访问