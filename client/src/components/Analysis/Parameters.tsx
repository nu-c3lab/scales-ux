import React, { FunctionComponent } from 'react';
import { AsyncTypeahead, Typeahead } from "react-bootstrap-typeahead";
import uniqid from "uniqid";
import { Form, Button, Col, Row, Accordion } from "react-bootstrap";

type Props = {
  parameters: any[];
  fetchAutocompleteSuggestions: (value: string, query) => Promise<string[]>;
  autoCompleteSuggestions: string[];
  setSelectedParameter: (parameter: any) => void;
  selectedParameter: string;
  loadingAutosuggestions: boolean;
}

const Parameters: FunctionComponent<Props> = ({
  parameters,
  fetchAutocompleteSuggestions,
  autoCompleteSuggestions,
  setSelectedParameter,
  selectedParameter,
  loadingAutosuggestions
}) => {
  return (
    <>{
      parameters && parameters.map((parameter, index) => {
        return (<Form.Group key={index} className="mb-3">
          {
            parameter.type === "string" &&
            <Col lg="8">
              {parameter?.prompt && <Form.Label>{parameter.prompt}</Form.Label>}
              <AsyncTypeahead
                as={Form.Control}
                id={uniqid()}
                isLoading={false}
                labelKey={null}
                minLength={3}
                onChange
                onSearch={(query) =>
                  fetchAutocompleteSuggestions(parameter.options.attribute, query)
                }
                options={autoCompleteSuggestions?.map(String)}
                placeholder="Search or select a statement..."
                selectHintOnEnter={true}
                defaultInputValue={""}
                loading={loadingAutosuggestions}
              />
            </Col>
          }
          {
            parameter.type === "boolean" &&
            <Form>
              <Form.Check
                type="switch"
                title={parameter.prompt}
                name={parameter.options.attribute}
                label={parameter.prompt}
              />
            </Form>
          }
          {
            parameter.type === "enum" &&
            <Form.Group as={Row}>
              <Col lg="8">
                <Form.Label>{parameter.prompt}</Form.Label>
                <Form.Select value={selectedParameter}
                  multiple={parameter.allowMultiple}
                  onChange={(e) => setSelectedParameter(e.target.value)}
                >
                  {
                    parameter?.options?.map((param, index) =>
                      <option key={index} value={param.value ? param.value : param}>{param.label ? param.label : param}</option>)
                  }
                </Form.Select>
              </Col>
            </Form.Group>
          }

        </Form.Group>)
      })
    }
    </>
  )
}

export default Parameters;