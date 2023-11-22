import React from 'react'
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Layout, Space } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { useAppSelector } from '../../Redux/store/store';
import ReveloHeader from '../../Components/Header/ReveloHeader';
import ExplorerContent from './ExplorerContent';
import './ExplorerContent.css'
const layoutStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
};
const contentStyle: React.CSSProperties = {
    flex: "1 1 auto",
    backgroundColor: "white",
    overflow: "hidden",

};
type Props = {
    reportName: string
}
const Explorer = (props: Props) => {
    const navigation = useNavigate()
    const { userInfo, } = useAppSelector(state => state.reveloUserInfo)
    useEffect(() => {
        if (!userInfo.status) {
            navigation('/')
        }
    }, [])
    const headerStyle: React.CSSProperties = {
        flex: "0 0 5%",
        paddingInline: 0,
        background: userInfo.userInfo.customerInfo.customerUXInfo.colors.primaryColor,
        position: 'fixed',
        top: 0,
        width: "100%",
        left: 0
    };
    return (
        <>
            <Space direction="vertical" style={{ width: '100%' }} size={[0, 48]}>
                <Layout style={layoutStyle}>
                    <Header style={headerStyle}><ReveloHeader userName={userInfo.userInfo.userName} orgName={userInfo.orgName} projectName={userInfo.userInfo.customerInfo.customerUXInfo.label} projectNameColor={userInfo.userInfo.customerInfo.customerUXInfo.colors.textColor} iconColor={userInfo.userInfo.customerInfo.customerUXInfo.colors.primaryDarkColor} /></Header>
                    <Content style={contentStyle}>
                        <ExplorerContent />
                    </Content>
                </Layout>
            </Space>
        </>
    )
}

export default Explorer