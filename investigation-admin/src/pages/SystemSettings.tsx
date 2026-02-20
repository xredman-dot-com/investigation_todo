import React, { useEffect, useMemo, useState } from "react"
import { Button, Card, Form, Input, Modal, Space, Table, Typography, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { listSettings, upsertSetting, type SystemSetting } from "../api/admin"

const { Title, Text } = Typography

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-"
  }
  if (typeof value === "string") {
    return value
  }
  return JSON.stringify(value)
}

const parseValue = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) {
    return ""
  }
  try {
    return JSON.parse(trimmed)
  } catch {
    return trimmed
  }
}

const SystemSettings: React.FC = () => {
  const [data, setData] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<SystemSetting | null>(null)
  const [form] = Form.useForm()

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await listSettings()
      setData(response)
    } catch {
      message.error("获取系统配置失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const columns: ColumnsType<SystemSetting> = useMemo(
    () => [
      { title: "Key", dataIndex: "key", width: 220 },
      {
        title: "Value",
        dataIndex: "value",
        render: (value) => formatValue(value)
      },
      { title: "说明", dataIndex: "description", render: (value) => value || "-" },
      { title: "更新时间", dataIndex: "updated_at" },
      {
        title: "操作",
        render: (_, record) => (
          <Button
            size="small"
            onClick={() => {
              setEditing(record)
              form.setFieldsValue({
                value: formatValue(record.value),
                description: record.description || ""
              })
            }}
          >
            编辑
          </Button>
        )
      }
    ],
    [data]
  )

  const onSave = async () => {
    try {
      const values = await form.validateFields()
      if (!editing) {
        return
      }
      await upsertSetting(editing.key, {
        value: parseValue(values.value),
        description: values.description || null
      })
      message.success("已保存")
      setEditing(null)
      fetchSettings()
    } catch {
      message.error("保存失败")
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={3}>系统配置</Title>
          <Text type="secondary">管理全站运行、公告与通知策略</Text>
        </div>
        <Space>
          <Button type="primary" onClick={fetchSettings}>
            刷新配置
          </Button>
        </Space>
      </div>

      <Card className="panel-card">
        <Table rowKey="id" dataSource={data} loading={loading} columns={columns} pagination={false} />
      </Card>

      <Modal
        open={!!editing}
        title={`编辑配置：${editing?.key || ""}`}
        onCancel={() => setEditing(null)}
        onOk={onSave}
        okText="保存"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Value" name="value" rules={[{ required: true, message: "请输入 value" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="说明" name="description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SystemSettings
