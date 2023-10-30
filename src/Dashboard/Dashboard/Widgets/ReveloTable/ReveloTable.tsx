import {  Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";



const ReveloTable = () => {

  interface DataType {
    id: string;
    label: string;
    value: number;
    count: number;
  }
  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Total Distance",
      dataIndex: "value",
      key: "value",
      render: (_, record) => (
        <>
          <Typography>{`${(record.value / 1000).toFixed(2)}KM`}</Typography>
        </>
      ),
    },
    {
      title: "Stops",
      dataIndex: "count",
      key: "count",
    },
  ];


  return (
    <div>
      <Table dataSource={[]} columns={columns} pagination={false} />
    </div>
  );
};

export default ReveloTable;
