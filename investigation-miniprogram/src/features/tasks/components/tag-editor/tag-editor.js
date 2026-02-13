// components/tag-editor/tag-editor.ts
Component({
    properties: {
        visible: {
            type: Boolean,
            value: false
        },
        tags: {
            type: Array,
            value: []
        }
    },
    data: {
        selectedTags: [],
        commonTags: ['工作', '个人', '学习', '健康', '购物', '财务', '旅行', '家庭'],
        allTags: [],
        newTag: ''
    },
    observers: {
        'visible': function (visible) {
            if (visible) {
                this.loadData();
            }
        },
        'tags': function (tags) {
            if (Array.isArray(tags)) {
                this.setData({ selectedTags: [...tags] });
            }
        }
    },
    methods: {
        loadData() {
            // TODO: Load all tags from backend
            const allTags = [
                '工作', '个人', '学习', '健康', '购物', '财务',
                '旅行', '家庭', '重要', '紧急', '待办',
                '想法', '项目', '会议', '电话', '邮件'
            ];
            this.setData({ allTags });
        },
        onTagInput(e) {
            this.setData({ newTag: e.detail.value.trim() });
        },
        onCreateTag() {
            if (!this.data.newTag)
                return;
            const tag = this.data.newTag.trim();
            // Check if tag already exists
            if (this.data.selectedTags.includes(tag)) {
                wx.showToast({ title: '标签已存在', icon: 'none' });
                return;
            }
            // Add to selected tags
            const selectedTags = [...this.data.selectedTags, tag];
            this.setData({
                selectedTags,
                newTag: ''
            });
            // Add to all tags if new
            if (!this.data.allTags.includes(tag)) {
                this.setData({
                    allTags: [...this.data.allTags, tag]
                });
            }
        },
        onToggleTag(e) {
            const { tag } = e.currentTarget.dataset;
            let selectedTags = [...this.data.selectedTags];
            if (selectedTags.includes(tag)) {
                selectedTags = selectedTags.filter(t => t !== tag);
            }
            else {
                selectedTags.push(tag);
            }
            this.setData({ selectedTags });
        },
        onRemoveTag(e) {
            const { tag } = e.currentTarget.dataset;
            const selectedTags = this.data.selectedTags.filter(t => t !== tag);
            this.setData({ selectedTags });
        },
        onCancel() {
            this.setData({ newTag: '' });
            this.triggerEvent('cancel');
        },
        onConfirm() {
            this.triggerEvent('confirm', { tags: this.data.selectedTags });
            this.setData({ newTag: '' });
        },
        onStopPropagation() {
            // Prevent event bubbling
        }
    }
});
