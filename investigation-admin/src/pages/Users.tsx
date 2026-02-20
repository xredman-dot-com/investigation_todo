import React, { useEffect, useMemo, useState } from "react"
import { Button, Card, Input, Select, Space, Table, Tag, Typography, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { listUsers, updateUser, type UserAdmin } from "../api/admin"

const { Title, Text } = Typography

const pageSize = 10

const Users: React.FC = () => {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState("all")
  const [role, setRole] = useState("all")
  const [data, setData] = useState<UserAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await listUsers({
        q: keyword || undefined,
        status: status === "all" ? undefined : status,
        role: role === "all" ? undefined : role,
        limit: pageSize,
        offset: (page - 1) * pageSize
      })
      setData(response)
    } catch (error) {
      message.error("获取用户列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [keyword, status, role, page])

  const columns: ColumnsType<UserAdmin> = useMemo(
    () => [
      { title: "用户 ID", dataIndex: "id", width: 220 },
      { title: "账号", dataIndex: "username", render: (value) => value || "-" },
      { title: "昵称", dataIndex: "nickname", render: (value) => value || "-" },
      {
        title: "角色",
        dataIndex: "role",
        render: (value) => {
          const color = value === "owner" ? "gold" : value === "admin" ? "blue" : "default"
          return <Tag color={color}>{value}</Tag>
        }
      },
      {
        title: "状态",
        dataIndex: "status",
        render: (value) => (
          <Tag color={value === "active" ? "green" : "red"}>{value === "active" ? "正常" : "已封禁"}</Tag>
        )
      },
      { title: "最近登录", dataIndex: "last_login_at", render: (value) => value || "-" },
      {
        title: "操作",
        render: (_, record) => {
          const isBanned = record.status === "banned"
          return (
            <Space>
              <Button size="small">详情</Button>
              <Button
                size="small"
                danger={!isBanned}
                onClick={async () => {
                  try {
                    await updateUser(record.id, { status: isBanned ? "active" : "banned" })
                    message.success(isBanned ? "已解封" : "已封禁")
                    fetchUsers()
                  } catch {
                    message.error("更新用户状态失败")
                  }
                }}
              >
                {isBanned ? "解封" : "封禁"}
              </Button>
            </Space>
          )
        }
      }
    ],
    [data]
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={3}>用户管理</Title>
          <Text type="secondary">面向全量用户的账号、行为与风险管理</Text>
        </div>
        <Space>
          <Button type="primary">导出用户</Button>
          <Button>批量操作</Button>
        </Space>
      </div>

      <Card className="panel-card">
        <div className="toolbar">
          <Input
            placeholder="搜索 openid / unionid / 昵称"
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
              { label: "正常", value: "active" },
              { label: "已封禁", value: "banned" }
            ]}
            className="toolbar-select"
          />
          <Select
            value={role}
            onChange={(value) => {
              setPage(1)
              setRole(value)
            }}
            options={[
              { label: "全部角色", value: "all" },
              { label: "用户", value: "user" },
              { label: "管理员", value: "admin" },
              { label: "Owner", value: "owner" }
            ]}
            className="toolbar-select"
          />
          <Button onClick={fetchUsers}>刷新</Button>
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

export default Users
