// components/quick-add/quick-add.ts
Component({
    properties: {
        placeholder: {
            type: String,
            value: '快速添加任务...'
        }
    },
    data: {
        value: ''
    },
    methods: {
        onInput(e) {
            this.setData({ value: e.detail.value });
        },
        onConfirm() {
            if (!this.data.value.trim())
                return;
            this.triggerEvent('add', { title: this.data.value });
            this.setData({ value: '' });
        }
    }
});
