import { useEffect } from "react"
import { useAppSelector } from "../Redux/store/store"
import { useNavigate } from "react-router-dom"
import ReveloHeader from "../Components/Header/ReveloHeader"
import { Layout, Space } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import DashBoard from "./Dashboard/DashBoard";
import JurisWidget from "../Components/Jurisdiction/JurisWidget";

const layoutStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%"
};
const contentStyle: React.CSSProperties = {
    flex: "1 1 auto",
    backgroundColor: "white",
    overflow: "hidden",

};
const RDashBoard = () => {
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
    };
    return (
        <>
            <Space direction="vertical" style={{ width: '100%' }} size={[0, 48]}>
                <Layout style={layoutStyle}>
                    <Header style={headerStyle}><ReveloHeader userName={userInfo.userInfo.userName} orgName={userInfo.orgName} projectName={userInfo.userInfo.customerInfo.customerUXInfo.label} projectNameColor={userInfo.userInfo.customerInfo.customerUXInfo.colors.textColor} iconColor={userInfo.userInfo.customerInfo.customerUXInfo.colors.primaryDarkColor} /></Header>
                    <Content style={contentStyle}>
                        <JurisWidget />
                    </Content>
                </Layout>
            </Space>
        </>
    )
}

export default RDashBoard