import React, { useState, useEffect } from 'react';
import {
  Button, Badge, Card, CardBody, CardHeader, Nav, Row, Col,
} from "reactstrap";
import ReactTable from "../../components/ReactTable/ReactTable";
import Jsona from 'jsona';
import apiCall from '../../helpers/apiCall';
import NotifyUser from '../../components/Alert/NotifyUser';

interface Props {
  globalState: any;
  history: any;
}

const Dashboard:React.FC<Props> = ({ globalState, history }) => {
  const [events, setEvents] = useState([]);
  const statusColorMap = {
    pending: "bg-info",
    approved: "bg-success",
    rejected: "bg-warning",
  };
  const isAdmin = () => globalState.userData.role === "admin";

  useEffect(() => {
    apiCall.fetchEntities('/leave_requests.json')
      .then((res) => {
        const dataFormatter = new Jsona();
        const eventData:any = dataFormatter.deserialize(res.data);
        setEvents(eventData);
        console.log(eventData);
      });
  }, []);

  const handleActions = (status, id) => {
    const postData = {
      status,
    };
    apiCall.submitEntity( postData, `/leave_requests/${id}.json`, "patch")
      .then((res) => {
        const dataFormatter = new Jsona();
        const data:any = dataFormatter.deserialize(res.data);
        const newEvents = events.map((el) => {
          if(el.id === id) {
            el = {...data, className: statusColorMap[data.status]};
          }
          return el;
        });
        setEvents(newEvents);
        NotifyUser(`Successfully ${status}!`, 'bc', `${status === 'approved' ? 'success' : 'danger'}`, globalState.notificationRef);
      });
  }
  
  return (
    <>
      <Card className="shadow mb-0">
        <CardHeader className="border-0 text-white bg-primary pb-6 px-5">
          <Row className="pt-4">
            <Col lg="6">
              <h6 className="fullcalendar-title h2 text-white d-inline-block mb-0 mr-1">
                Leave Requests
              </h6>
              <Nav aria-label="breadcrumb" className="d-none d-inline-block ml-lg-4">
                <ol className="breadcrumb breadcrumb-links breadcrumb-dark">
                  <li className="breadcrumb-item active" aria-current="page"><i className="fas fa-home" /> - Dashboard</li>
                  <li className="breadcrumb-item" onClick={() => history.push('/admin/calendar')}>Calendar</li>
                </ol>
              </Nav>
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="mt--6">
          <div className="bg-white shadow-lg p-5 pb-7" style={{ borderRadius: 5 }}>
            <ReactTable
              resizable={false}
              data={events}
              loading={false}
              columns={[
                {
                  Header: "Username",
                  id: "username",
                  Cell: (row) => {
                    const {user} = row.original;
                    return `${user.first_name} ${user.last_name}`;
                  },
                  style: { whiteSpace: "unset"},
                },
                {
                  Header: "Start Date",
                  accessor: "start",
                  style: { whiteSpace: "unset"},
                },
                {
                  Header: "End Date",
                  accessor: "end",
                  style: { whiteSpace: "unset"},
                },
                {
                  id: "duration",
                  Header: "Duration",
                  Cell: (row) => {
                    const {start, end} = row.original;
                    const startDate: number = new Date(start).getTime();
                    const endDate: number = new Date(end).getTime();
                    const numberOfDays = Math.abs(startDate - endDate)/86400000;
                    return numberOfDays;
                  },
                },
                {
                  Header: "Reason",
                  accessor: "title",
                  style: { whiteSpace: "unset"},
                },
                {
                  id: "status",
                  accessor: "status",
                  Header: "Status",
                  Cell: (row) => {
                    const {status} = row.original;
                    return (
                      <Badge color="" className="badge-dot float-right text-capitalize">
                        <i className={statusColorMap[status]} />
                        {status}
                      </Badge>
                    )
                  },
                  filterable: true,
                },
                {
                  Header: 'Actions',
                  show: isAdmin(),
                  Cell: (row) => (
                    <div className="actions-right">
                      {row.original.status !== "approved" && (
                        <Button
                          onClick={() => {
                            const id = row.original.id;
                            handleActions('approved', id);
                          }}
                          color="success"
                          size="sm"
                          className="btn-icon btn-link like"
                        >
                          <i className="tim-icons icon-check-2 text-white font-weight-bold" />
                        </Button>
                      )}
                      {row.original.status !== "rejected" && (
                        <Button
                          onClick={() => {
                            const id = row.original.id;
                            handleActions('rejected', id);
                          }}
                          color="danger"
                          size="sm"
                          className="btn-icon btn-link like"
                        >
                          <i className="tim-icons icon-simple-remove text-white font-weight-bold" />
                        </Button>
                      )}
                    </div>
                  ),
                  filterable: false,
                  sortable: false,
                },
              ]}
              defaultPageSize={5}
              showPaginationBottom
              className="-striped -highlight text-capitalize"
            />
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default Dashboard;