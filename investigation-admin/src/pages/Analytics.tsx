import React from "react"
import { Card, Empty, Typography } from "antd"

const { Title, Text } = Typography

const Analytics: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Title level={3}>数据统计</Title>
          <Text type="secondary">当前后台缺少全量统计接口，待后端补齐</Text>
        </div>
      </div>

      <Card className="panel-card">
        <Empty description="暂无可用的全量用户统计接口" />
      </Card>
    </div>
  )
}

export default Analytics
