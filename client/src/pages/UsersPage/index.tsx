import React, { FunctionComponent, useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridCellParams,
} from "@material-ui/data-grid";
import { Tooltip, Typography } from "@material-ui/core";
import PageLayout from "../../components/PageLayout";
import NotAuthorized from "../../components/NotAuthorized";
import UserFieldToggle from "./UserFieldToggle";
import { Row } from "react-bootstrap";
import { useAuthHeader, userSelector } from "store/auth";
import { useSelector } from "react-redux";
import DeleteUser from "./DeleteUser";
const AdminUsersPages: FunctionComponent = () => {
  const [rows, setRows] = useState([]);
  const authorizationHeader = useAuthHeader();
  const { role, id } = useSelector(userSelector);
  const isAdmin = role === 'admin';

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 100 },
    {
      field: "fullName",
      headerName: "Full name",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 200,
      valueGetter: (params: GridValueGetterParams) =>
        `${params.getValue(params.id, "firstName") || ""} ${params.getValue(params.id, "lastName") || ""
        }`,
    },
    { field: "email", headerName: "Email", width: 240 },
    {
      field: "usage",
      headerName: "Usage",
      width: 290,
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.row.usage}>
          <Typography noWrap variant="body2">
            {params.row.usage}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "approved",
      headerName: "Approved",
      width: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params: GridCellParams) => (
        <UserFieldToggle
          userId={params.row.id}
          fieldName="approved"
          value={params.row.approved}
          disabled={params.row.id === id}
        />
      ),
    },
    {
      field: "blocked",
      headerName: "Blocked",
      width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridCellParams) => (
        <UserFieldToggle
          userId={params.row.id}
          fieldName="blocked"
          value={params.row.blocked}
          disabled={params.row.id === id}
        />
      ),
    },
  ];

  if (isAdmin) {
    columns.push({
      field: "admin", headerName: "Admin", width: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridCellParams) => {
        return (
          <UserFieldToggle
            disabled={params.row.id === id}
            userId={params.row.id}
            fieldName="role"
            value={params.row.role === 'admin'}
          />
        );
      }
    });
    columns.push({
      field: "delete",
      headerName: "Delete",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridCellParams) => {
        return (
          <DeleteUser userId={params.row.id} disabled={params.row.id === id} />
        );
      }
    });
  }

  useEffect(() => {
    fetch(`/api/users`, {
      headers: {
        ...authorizationHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setRows(response.data.users);
      });
  }, []);

  return (
    <PageLayout>
      {!isAdmin ? (
        <NotAuthorized />
      ) : (
        <Row style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            checkboxSelection={false}
            className="bg-white p-0"
          />
        </Row>
      )}
    </PageLayout>
  );
};

export default AdminUsersPages;
