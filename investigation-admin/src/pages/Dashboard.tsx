import React, { useEffect, useMemo, useState } from "react"
import { Card, Col, List, Row, Statistic, Table, Tag, Typography, message } from "antd"
import {
  fetchAdminSummary,
  listModerationItems,
  listUsers,
  type AdminSummary,
  type ModerationItem,
  type UserAdmin
} from "../api/admin"

const { Title, Text } = Typography

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<UserAdmin[]>([])
  const [moderation, setModeration] = useState<ModerationItem[]>([])
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [summaryResponse, usersResponse, moderationResponse] = await Promise.all([
        fetchAdminSummary(),
        listUsers({ limit: 50, offset: 0 }),
        listModerationItems({ limit: 20, offset: 0 })
      ])
      setSummary(summaryResponse)
      setUsers(usersResponse)
      setModeration(moderationResponse)
    } catch {
      message.error("获取概览数据失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const activeUsers = useMemo(() => summary?.users_active ?? 0, [summary])
  const bannedUsers = useMemo(() => summary?.users_banned ?? 0, [summary])
  const pendingModeration = useMemo(
    () => summary?.moderation_pending ?? 0,
    [summary]
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={3}>运营总览</Title>
          <Text type="secondary">来自全量后台接口的实时汇总</Text>
        </div>
        <div className="page-pill">已同步</div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <Card className="metric-card" loading={loading}>
            <Statistic title="累计用户" value={summary?.users_total ?? 0} />
            <Text type="secondary">全量用户统计</Text>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card className="metric-card" loading={loading}>
            <Statistic title="正常用户" value={activeUsers} />
            <Text type="secondary">活跃状态</Text>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card className="metric-card" loading={loading}>
            <Statistic title="已封禁" value={bannedUsers} />
            <Text type="secondary">全量封禁统计</Text>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card className="metric-card" loading={loading}>
            <Statistic title="待审核" value={pendingModeration} />
            <Text type="secondary">全量待审核</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="section">
        <Col xs={24} lg={14}>
          <Card title="最近用户" className="panel-card" loading={loading}>
            <Table
              rowKey="id"
              pagination={false}
              dataSource={users.slice(0, 6)}
              columns={[
                { title: "用户 ID", dataIndex: "id" },
                { title: "昵称", dataIndex: "nickname", render: (value) => value || "-" },
                { title: "角色", dataIndex: "role" },
                {
                  title: "状态",
                  dataIndex: "status",
                  render: (value) => (
                    <Tag color={value === "active" ? "green" : "red"}>{value === "active" ? "正常" : "已封禁"}</Tag>
                  )
                }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最新审核队列" className="panel-card" loading={loading}>
            <List
              dataSource={moderation.slice(0, 6)}
              renderItem={(item) => (
                <List.Item>
                  <Tag color={item.status === "pending" ? "gold" : item.status === "approved" ? "green" : "red"}>
                    {item.status}
                  </Tag>
                  <Text>{item.content_text || item.content_id || item.content_type}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
