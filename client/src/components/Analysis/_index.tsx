import React, { useState, useEffect, FunctionComponent } from "react";
import { StatementManager } from "statement-mananger";
import { BsXOctagonFill } from "react-icons/bs";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import uniqid from "uniqid";
import { useNotify } from "../Notifications";
import { Form, Button, Col, Row, Card } from "react-bootstrap"
import { usePanel } from "store/panels";
import axios from "axios";
import Select from 'react-select'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./style.scss"
import config from "config";

type AnalysisProps = {
  panelId: string;
  ring: IRing;
  info: IRingInfo;
}

const Analysis: FunctionComponent<AnalysisProps> = ({ panelId, ring, info }) => {
  const { panel, analysis } = usePanel(panelId);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [statements, setStatements] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
  const { notify } = useNotify();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!info) return;
    const SM = new StatementManager(info.operations, info.analysisSpace, ring);
    setStatements(SM.generate());
  }, [info]);

  const getStatement = (statement) => {
    return statements.find(s => s.statement === statement);
  }

  console.log(getStatement(selectedStatement), info);


  const getAnswers = async (parameters, statement) => {
    setData(null);

    const statementsrc = getStatement(statement);

    console.log(statementsrc);

    const plan = statementsrc?.plan;
    plan.rings = [ring.rid];

    // write a post axios call to the server with headers and body


    // const a = await axios.get(`${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/analysis/${ring.rid}/${ring.version}/${info?.defaultEntity}`, {
    //   data: {...plan},
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-api-key": "sIXOzihpQOePxmOheWeOsw26slDwiqsqN4v2dv30M"
    //   }
    // });


    // console.log(a);
    // const response = await axios.get(`${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/analysis/${ring.rid}/${ring.version}/${info?.defaultEntity}`, { ...plan });
    // console.log(response);
    // const response2 = await axios.get(`https://satyrn-api.nulab.org/api/analysis/20e114c2-ef05-490c-bdd8-f6f271a6733f/1/Contribution`, {
    //   body: {
    //     ...plan,
    //   },
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-api-key": "sIXOzihpQOePxmOheWeOsw26slDwiqsqN4v2dv30M"
    //   });
    // const response2 = await axios.get("${process.env.REACT_APP_BFF_PROXY_ENDPOINT_URL}/analysis/${ring.rid}/${ring.version}/${info?.defaultEntity}", { ...plan }, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Accept": "application/json",
    //     "x-api-key": "sIXOzihpQOePxmOheWeOsw26slDwiqsqN4v2dv30M"
    //   });
    // console.log(response);
    // setIsLoading(true);
    const response = await fetch(`https://satyrn-api.nulab.org/api/analysis/20e114c2-ef05-490c-bdd8-f6f271a6733f/1/Contribution/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sIXOzihpQOePxmOheWeOsw26slDwiqsqN4v2dv30M"
      },
      body: JSON.stringify(plan)
    });
    const data = await response.json();
    setData(data);
    console.log(data);
    //   setIsLoading(false);
    //   if (data.error) {
    //     // notify(data.error, "danger");
    //     return;
    //   }
    //   return data;
    // }
  }

  const getFilterFromInfo = (fieldName, info) => {

    console.log(fieldName, info, getStatement(selectedStatement)?.plan?.target?.field);
    if (!info || !fieldName) return;
    const filter = info?.filters?.find(f => f[0] === fieldName);
    if (!filter) return null;
    return filter[1];
  }


  const fetchAutocompleteSuggestions = async (type, query) => {
    setIsLoading(true);
    setAutoCompleteSuggestions([]);
    try {
      const response = await fetch(
        `${config.SERVER_PROXY_URL}/autocomplete/${ring.rid}/1/${info?.defaultEntity}/${type}?query=${query}`
      );
      // @ts-ignore
      if (response.status === 200) {
        const data = await response.json();
        data instanceof Array && setAutoCompleteSuggestions(data);
        // @ts-ignore
        response?.success === false && notify(response?.message || "Could not fetch autocomplete suggestions", "error");
        setIsLoading(false);
      } else {
        notify("Could not fetch autocomplete suggestions", "error");
      }
    } catch (error) {
      console.log(error);
      notify("Could not fetch autocomplete suggestions", "error");
    } finally {
      setIsLoading(false);
    }
  };


  const data2 = [
    {
      name: 'False',
      value: 1.875,
      amount: 1.875,
    },
    {
      name: 'True',
      value: 1.6666666666666667,
      amount: 2,
    }
  ];


  return (<Col>

    <Form.Group className="mb-3" as={Row}>
      <Col>
        <Select
          defaultValue={selectedStatement}
          isDisabled={selectedStatement !== null}
          onChange={({ value }) => {

            setSelectedStatement(value);
            // setPanelAnalysisStatement({ id: e.target.value, statement: e.target.value });
            const statement = getStatement(value);
            if (statement.parameters) {
              setParameters(statement.parameters);
            }
          }}
          options={statements.map(({ statement }) => ({
            value: statement,
            label: statement
          }))} />

      </Col>
      <Col>
        {selectedStatement && <Button variant="link" onClick={() => {
          setSelectedStatement(null);
          setParameters([]);
          setData(null);
        }}><BsXOctagonFill /></Button>}
      </Col>
    </Form.Group>

    {parameters && parameters.map((parameter, index) => {
      return (<Form.Group key={index} className="mb-3">
        {parameter.type === "string" && (
          <Col lg="6">
            {parameter?.prompt && <Form.Label>{parameter.prompt}</Form.Label>}
            <AsyncTypeahead
              as={Form.Control}
              id={uniqid()}
              filterBy={() => true}
              isLoading={false}
              labelKey={null}
              minLength={3}
              onSearch={(query) =>
                fetchAutocompleteSuggestions(parameter.options.attribute, query)
              }
              options={autoCompleteSuggestions?.map(String)}
              placeholder="Type..."
              defaultInputValue={""}

            // onBlur={(event) =>
            //   setFilter({ ...filter, value: event.target.value })
            // }
            />
          </Col>
        )
        }
        {parameter.type === "boolean" &&
          <Form>
            <Form.Check
              type="switch"
              title={parameter.prompt}
              name={parameter.options.attribute}
              label={parameter.prompt}
            />
          </Form>
        }
        {parameter.type === "enum" &&
          <Form.Group as={Row}>
            <Col lg="6">
              <Form.Select value={selectedParameter}
                onChange={(e) => {
                  setSelectedParameter(e.target.value);
                  // setSelectedStatement(e.target.value);
                  // setPanelAnalysisStatement({ id: e.target.value, statement: e.target.value });
                }
                }
                disabled={selectedParameter !== null}>

                {parameter?.options?.map((value, index) => <option key={index} value={value}>{value}</option>)}
              </Form.Select>
            </Col>
            <Col lg="6">
              {selectedParameter && <Button variant="link" onClick={() => {
                setSelectedParameter(null);
                // setParameters([]);
              }}><BsXOctagonFill /></Button>}
            </Col>
          </Form.Group>
        }

      </Form.Group>)
    })
    }

    {/* {parameters.length === 0 && getFilterFromInfo(getStatement(selectedStatement)?.plan?.target?.field, info) && (
      <Form.Group className="mb-3">
        <Col lg="6">
          <Form.Label>{
            getFilterFromInfo(getStatement(selectedStatement)?.plan?.field, info)?.niceName
          }</Form.Label>
          <AsyncTypeahead
            as={Form.Control}
            id={uniqid()}
            filterBy={() => true}
            isLoading={isLoading}
            labelKey={null}
            minLength={3}
            onSearch={(query) =>
              fetchAutocompleteSuggestions(getStatement(selectedStatement)?.plan?.target?.field, query)
            }
            options={autoCompleteSuggestions?.map(String)}
            placeholder="Type..."
            defaultInputValue={""}
          />
        </Col>
      </Form.Group>

    )} */}

    {selectedStatement && <Button
      className="mt-1 mb-1 text-white"
      onClick={() => getAnswers(parameters, selectedStatement)}>
      Generate Answer
    </Button>}

    {
      data &&
      <div>

        {data.length > 1 && <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data.results.map((result) => ({
              name: result.split(',')[0].replace(/\(|\)/g, ''),
              value: result.split(',')[1].replace(/\(|\)/g, ''),
            }))}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>}
        <code className="mt-5">
          {
            JSON.stringify(data)
          }
        </code>
      </div>
    }

  </Col >);
}

export default Analysis;
