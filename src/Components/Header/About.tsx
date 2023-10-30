import { Typography } from "antd";
const About = () => {
    return (
        <div style={{margin:"10px"}}>
            
            <h4 style={{ color: "#0075ea" }}>Revelo</h4>
            <Typography.Paragraph>
                Revelo is a Spatial Decision Support System that helps organizations
                visualize, analyze, collect and understand data in the context of their
                business domain and make fruitful use of those data to make decisions.
                Revelo improves decision making capabilities and brings forth unique
                insights to help you make quicker and more effective decisions. It is
                vertical agnostic and provides tools for automatic data validation, easy
                change management, near real time data collection and analytics, user
                tracking, jurisdiction based security and geofencing.
            </Typography.Paragraph>
            <h4 style={{ color: "#0075ea" }}>6Simplex</h4>
            <Typography.Paragraph>
                Simplex Software Solutions Pvt. Ltd, Nagpur, Maharashtra, India is a
                geospatial software services and products development company that
                offers geospatial software solutions and consultancy services. We also
                provide consultation services to Government organizations that seek to
                enhance their technological capabilities and ability to use location
                based information to aid smoother functioning and decision making,
                ultimately improving the services they offer to their customers, i.e.
                the citizens.
            </Typography.Paragraph>
        </div>
    );
};
export default About;
