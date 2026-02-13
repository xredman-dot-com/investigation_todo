// components/task-card/task-card.ts
Component({
    properties: {
        task: {
            type: Object,
            value: {}
        }
    },
    methods: {
        onToggle() {
            this.triggerEvent('toggle', { taskId: this.properties.task.id });
        },
        onTap() {
            this.triggerEvent('tap', { taskId: this.properties.task.id });
        },
        onDetail() {
            this.triggerEvent('detail', { taskId: this.properties.task.id });
        },
        onMore() {
            this.triggerEvent('more', { taskId: this.properties.task.id });
        }
    }
});
