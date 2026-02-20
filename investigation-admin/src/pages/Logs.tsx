import React, { useEffect, useState } from "react"
import { Card, Input, Select, Space, Table, Tag, Typography, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { listAuditLogs, type AuditLog } from "../api/admin"

const { Title, Text } = Typography

const pageSize = 10

const Logs: React.FC = () => {
  const [action, setAction] = useState("all")
  const [resourceType, setResourceType] = useState("all")
  const [keyword, setKeyword] = useState("")
  const [data, setData] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await listAuditLogs({
        action: action === "all" ? undefined : action,
        resource_type: resourceType === "all" ? undefined : resourceType,
        q: keyword || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize
      })
      setData(response)
    } catch {
      message.error("获取审计日志失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [action, resourceType, keyword, page])

  const columns: ColumnsType<AuditLog> = [
    { title: "时间", dataIndex: "created_at", width: 180 },
    { title: "动作", dataIndex: "action" },
    { title: "资源类型", dataIndex: "resource_type" },
    { title: "资源 ID", dataIndex: "resource_id", render: (value) => value || "-" },
    {
      title: "操作人",
      dataIndex: "actor_id",
      render: (value) => value || "-"
    },
    {
      title: "详情",
      dataIndex: "detail",
      render: (value) => {
        if (!value) {
          return "-"
        }
        const text = typeof value === "string" ? value : JSON.stringify(value)
        return <Tag color="blue">{text}</Tag>
      }
    }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={3}>操作日志</Title>
          <Text type="secondary">记录管理员对用户、审核与系统配置的操作</Text>
        </div>
      </div>

      <Card className="panel-card">
        <div className="toolbar">
          <Input
            placeholder="搜索资源 ID"
            value={keyword}
            onChange={(event) => {
              setPage(1)
              setKeyword(event.target.value)
            }}
            className="toolbar-input"
          />
          <Select
            value={action}
            onChange={(value) => {
              setPage(1)
              setAction(value)
            }}
            options={[
              { label: "全部动作", value: "all" },
              { label: "用户更新", value: "user.update" },
              { label: "审核创建", value: "moderation.create" },
              { label: "审核更新", value: "moderation.update" },
              { label: "配置更新", value: "settings.upsert" }
            ]}
            className="toolbar-select"
          />
          <Select
            value={resourceType}
            onChange={(value) => {
              setPage(1)
              setResourceType(value)
            }}
            options={[
              { label: "全部资源", value: "all" },
              { label: "用户", value: "user" },
              { label: "审核条目", value: "moderation_item" },
              { label: "系统配置", value: "system_setting" }
            ]}
            className="toolbar-select"
          />
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

export default Logs
