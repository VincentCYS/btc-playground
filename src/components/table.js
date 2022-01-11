import React, { useEffect, useState } from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  ThemeProvider,
} from "@material-ui/core";
import MuiTheme from "../theme/index";

const columns = [
  { id: "path", label: "Path", minWidth: 50 },
  { id: "index", label: "Index", minWidth: 50 },
  {
    id: "legacyAddress",
    label: "Legacy Address",
    minWidth: 170,
  },

  {
    id: "nestedAddress",
    label: "Segwit Address",
    minWidth: 170,
  },
  {
    id: "bech32Address",
    label: "Segwit Native Address",
    minWidth: 170,
  },
];

export default function StickyHeadTable(props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState(props.rows || []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    setRows(props.rows);
  }, []);

  return (
    <ThemeProvider theme={MuiTheme}>
      <Paper
        // sx={{ width: "100%", overflow: "hidden" }}
        style={{ backgroundColor: "grey", borderRadius: 35, maxWidth: "75vw" }}
      >
        <TableContainer sx={{ maxHeight: 440 }} style={{ borderRadius: 35 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead style={{ borderRadius: 35 }}>
              <TableRow>
                {columns.map((column, i) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                      backgroundColor: "#10AFAE",
                      borderTopRightRadius: i + 1 == columns.length ? 35 : 0,
                      borderTopLeftRadius: i == 0 ? 35 : 0,
                      paddingTop: 20,
                      paddingLeft: 20,
                      paddingRight: 20,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.code}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </ThemeProvider>
  );
}
