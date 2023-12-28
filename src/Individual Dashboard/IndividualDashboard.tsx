import React from 'react';
import { Layout, Space, } from 'antd';
import { useAppSelector } from '../Redux/store/store';
import ReveloHeader from '../Components/Header/ReveloHeader';
import IndividualReport from './Individual Reports/IndividualReport';

const { Header, Content } = Layout;

type Props = {
  reportName: string
}

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

const IndividualDashboard = (props: Props) => {
  const { userInfo, project } = useAppSelector(state => state.reveloUserInfo)
  const headerStyle: React.CSSProperties = {
    flex: "0 0 5%",
    paddingInline: 0,
    background: userInfo.userInfo.customerInfo.customerUXInfo.colors.primaryColor,
  };
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={[0, 48]}>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}><ReveloHeader userName={userInfo.userInfo.userName} orgName={userInfo.orgName} projectName={project.label} projectNameColor={userInfo.orgUXInfo.colors.textColor} iconColor={userInfo.orgUXInfo.colors.primaryDarkColor}/></Header>
        <Content style={contentStyle}>
          {/* content{props.statsId} */}
          <IndividualReport reportName={props.reportName}/>
        </Content>
      </Layout>
    </Space>
  )
}

export default IndividualDashboard;



