import React from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import {
  AuditOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons"
import { Avatar, Badge, Layout, Menu, Space, Typography } from "antd"

const { Header, Sider, Content } = Layout
const { Text, Title } = Typography

const menuItems = [
  {
    key: "/",
    icon: <DatabaseOutlined />,
    label: <Link to="/">总览</Link>
  },
  {
    key: "/users",
    icon: <TeamOutlined />,
    label: <Link to="/users">用户管理</Link>
  },
  {
    key: "/moderation",
    icon: <AuditOutlined />,
    label: <Link to="/moderation">内容审核</Link>
  },
  {
    key: "/analytics",
    icon: <BarChartOutlined />,
    label: <Link to="/analytics">数据统计</Link>
  },
  {
    key: "/system",
    icon: <SettingOutlined />,
    label: <Link to="/system">系统配置</Link>
  },
  {
    key: "/logs",
    icon: <UserOutlined />,
    label: <Link to="/logs">操作日志</Link>
  }
]

const AdminLayout: React.FC = () => {
  const location = useLocation()
  const selectedKey = location.pathname === "/" ? "/" : `/${location.pathname.split("/")[1]}`

  return (
    <Layout className="app-shell">
      <Sider width={240} className="app-sider">
        <div className="brand">
          <div className="brand-mark">GW</div>
          <div>
            <Title level={4} className="brand-title">格物清单</Title>
            <Text className="brand-subtitle">全量用户信息后台</Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="app-menu"
        />
        <div className="sider-footer">
          <Text className="sider-label">系统状态</Text>
          <div className="sider-meta">
            <Badge status="processing" text="运行正常" />
            <Text type="secondary">最近同步 2 分钟前</Text>
          </div>
        </div>
      </Sider>
      <Layout>
        <Header className="app-header">
          <Space size="large">
            <div>
              <Title level={5} className="header-title">管理中心</Title>
              <Text type="secondary">面向全部用户的数据治理与运营</Text>
            </div>
          </Space>
          <Space size="middle">
            <div className="header-kpi">
              <Text type="secondary">今日新增</Text>
              <Title level={5} className="header-kpi-value">+128</Title>
            </div>
            <div className="header-kpi">
              <Text type="secondary">待审核</Text>
              <Title level={5} className="header-kpi-value">24</Title>
            </div>
            <Avatar size={36} icon={<UserOutlined />} />
          </Space>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
