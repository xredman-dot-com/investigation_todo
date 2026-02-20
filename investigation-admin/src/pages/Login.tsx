import React from "react"
import { useNavigate } from "react-router-dom"
import { Button, Card, Form, Input, Typography, message } from "antd"
import { setAuthToken } from "../api/client"
import { adminLogin } from "../api/auth"

const { Title, Text } = Typography

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await adminLogin(values)
      setAuthToken(response.access_token)
      message.success("登录成功")
      navigate("/")
    } catch {
      message.error("登录失败，请检查账号或权限")
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <Title level={3}>管理员登录</Title>
        <Text type="secondary">仅管理员可登录后台</Text>
        <Form form={form} layout="vertical" style={{ marginTop: 24 }} onFinish={onFinish}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: "请输入账号" }]}>
            <Input placeholder="admin" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" block htmlType="submit">
            登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default Login
