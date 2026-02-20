import React, { useEffect, useState } from "react"
import { Button, Card, Input, Select, Space, Table, Tag, Typography, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { listModerationItems, updateModerationItem, type ModerationItem } from "../api/admin"

const { Title, Text } = Typography

const pageSize = 10

const Moderation: React.FC = () => {
  const [status, setStatus] = useState("all")
  const [contentType, setContentType] = useState("all")
  const [keyword, setKeyword] = useState("")
  const [data, setData] = useState<ModerationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await listModerationItems({
        status: status === "all" ? undefined : status,
        content_type: contentType === "all" ? undefined : contentType,
        q: keyword || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize
      })
      setData(response)
    } catch {
      message.error("获取审核列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [status, contentType, keyword, page])

  const columns: ColumnsType<ModerationItem> = [
    { title: "内容类型", dataIndex: "content_type" },
    { title: "内容 ID", dataIndex: "content_id", render: (value) => value || "-" },
    { title: "摘要", dataIndex: "content_text", render: (value) => value || "-" },
    { title: "原因", dataIndex: "reason", render: (value) => value || "-" },
    {
      title: "状态",
      dataIndex: "status",
      render: (value) => {
        const color = value === "pending" ? "gold" : value === "approved" ? "green" : "red"
        const label = value === "pending" ? "待处理" : value === "approved" ? "已通过" : "已拒绝"
        return <Tag color={color}>{label}</Tag>
      }
    },
    {
      title: "操作",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            disabled={record.status !== "pending"}
            onClick={async () => {
              try {
                await updateModerationItem(record.id, { status: "approved" })
                message.success("已通过")
                fetchItems()
              } catch {
                message.error("更新失败")
              }
            }}
          >
            通过
          </Button>
          <Button
            size="small"
            danger
            disabled={record.status !== "pending"}
            onClick={async () => {
              try {
                await updateModerationItem(record.id, { status: "rejected" })
                message.success("已拒绝")
                fetchItems()
              } catch {
                message.error("更新失败")
              }
            }}
          >
            拒绝
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={3}>内容审核</Title>
          <Text type="secondary">集中处理用户举报、敏感内容与风控信号</Text>
        </div>
        <Space>
          <Button type="primary">批量分派</Button>
          <Button>策略配置</Button>
        </Space>
      </div>

      <Card className="panel-card">
        <div className="toolbar">
          <Input
            placeholder="搜索内容 ID / 文本"
            value={keyword}
            onChange={(event) => {
              setPage(1)
              setKeyword(event.target.value)
            }}
            className="toolbar-input"
          />
          <Select
            value={status}
            onChange={(value) => {
              setPage(1)
              setStatus(value)
            }}
            options={[
              { label: "全部状态", value: "all" },
              { label: "待处理", value: "pending" },
              { label: "已通过", value: "approved" },
              { label: "已拒绝", value: "rejected" }
            ]}
            className="toolbar-select"
          />
          <Select
            value={contentType}
            onChange={(value) => {
              setPage(1)
              setContentType(value)
            }}
            options={[
              { label: "全部类型", value: "all" },
              { label: "任务", value: "task" },
              { label: "清单", value: "list" },
              { label: "评论", value: "comment" }
            ]}
            className="toolbar-select"
          />
          <Button onClick={fetchItems}>刷新</Button>
        </div>

        <Table
          rowKey="id"
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            onChange: (nextPage) => setPage(nextPage)
          }}
          columns={columns}
        />
      </Card>
    </div>
  )
}

export default Moderation
