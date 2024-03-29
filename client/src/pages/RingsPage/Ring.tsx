import React, { useState, useEffect } from "react";
import PageLayout from "components/PageLayout";
import Loader from "components/Loader";
import { useFormik } from "formik";
import * as yup from "yup";
import { Form, Button, Row, Col } from "react-bootstrap";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";
import { useAuthHeader, useUser } from "store/auth";
import { useNotify } from "components/Notifications";
import { useHistory, useParams } from "react-router-dom";
import { useRing, useRings } from "store/rings";
import uniqid from 'uniqid';
import ReactSelect from "react-select";

type Params = {
  ringId: string | null;
};

const Ring: React.FC = () => {
  const { ringId = null } = useParams<Params>();
  const { ring } = useRing(Number(ringId));
  const {getRings, rings} = useRings();
  const [loading, setLoading] = useState(false)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const authHeader = useAuthHeader();
  const user = useUser();
  const { notify } = useNotify();
  const history = useHistory();
  const [ringVersions, setRingVersions] = useState<any[]>([]);

  console.log(ringVersions);

  const fetchRingVersionsByRid = async (rid: number) => {
    try {
      setLoadingVersions(true);
      const response = await fetch(`/api/rings/${rid}/versions`, {
        headers: authHeader,
      });
      const {data} = await response.json();
      setRingVersions(data.versions);
      setLoadingVersions(false);

    } catch (error) {
      notify("Error fetching ring versions", "error");
    }
  }

  useEffect(() => {
    if (ring) {
      fetchRingVersionsByRid(ring.rid);
    }
  } , [ring])
    
  const formik = useFormik({
    initialValues: {
      rid: uniqid(),
      name: "",
      description: "",
      version: 1.0,
      schemaVersion: 1.0,
      dataSource: {},
      ontology: {},
      visibility: "public",
      userId: user.id,
      ...ring
    },
    validationSchema: yup.object({
      rid: yup.string().required("RID is required"),
      name: yup.string().required("Name is required"),
      description: yup.string().required("Description is required"),
      version: yup.number().required("Version is required"),
      schemaVersion: yup.number().required("Schema version is required"),
      dataSource: yup.object().required("Data source is required"),
      ontology: yup.object().required("Ontology is required"),
      visibility: yup.string().required("Visibility is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      fetch(ringId ? `/api/rings/${ringId}` : `/api/rings/create`, {
        method: ringId ? "PUT" : "POST",
        body: JSON.stringify(values),
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((response) => {
          try {
            if (response?.code === 200) {
              notify(response.message, "success");
              if (response?.data?.ring){
                formik.setValues({
                  ...formik.values,
                  ...response.data.ring,
                });
                getRings();
              }
              if (!ringId) {
                history.push("/rings");
              }
            }
          } catch (error) {
            console.log(error);
            notify(error.message, "error");
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setLoading(false))
    }
  });

  const deleteRing = async (rid) => {
    setLoading(true)
    fetch(`/api/rings/${rid}`, {
      method: "DELETE",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
    }).then((response) => response.json())
      .then((response) => {
        try {
          switch (response?.code) {
            case 200:
              notify(response.message, "success");
              history.push("/rings");
              break;
            default:
              notify(response.message, "error");
              break;
          }
        } catch (error) {
          console.log(error);
          notify(error.message, "error");
        }
      }).catch((error) => console.log(error))
      .finally(() => setLoading(false))
  }

  const sanitizeData = (data) => {
    let output = {}

    if (typeof data === "string") {
      output = JSON.parse(data);
    }

    if (typeof data === "object") {
      output = data;
    }

    return output;
  }

  return (
    <PageLayout>
      <Loader animation="border" isVisible={loading}>
        <Form onSubmit={formik.handleSubmit}>
          <Row className="mb-3">
            <Col>
              <h3 className="mb-3">
                {
                  ring ? "Edit Ring" : "Create Ring"
                }
              </h3>
            </Col>
            <Col>
              <Button variant="primary" type="submit" className="text-white float-end ms-2">
                Submit
              </Button>
              {
                ring && (
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => window.confirm("Are you sure you want to delete this ring?") && deleteRing(ring.id)}
                    className="float-end">
                    Delete Ring
                  </Button>
                )
              }
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Ring Versions</Form.Label>
                <ReactSelect
                  isLoading={loadingVersions}
                  options={ringVersions?.map((version) => ({
                    value: version.version,
                    label: `Version: ${version.version} Schema Version ${version.schemaVersion} CreatedAt: ${version.createdAt}`,
                  }))}
                  onChange={(e) => {
                    if (e?.value) {
                      //
                    } 
                  } }
                  isClearable={true}
                  isSearchable={true}
                  placeholder="Select a version"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group controlId="formName" className="mb-2" as={Col}>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name ? (
                <Form.Text className="text-danger">{formik.errors.name}</Form.Text>
              ) : null}
            </Form.Group>
          </Row>
          <Form.Group controlId="formDescription" className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description ? (
              <Form.Text className="text-danger">
                {formik.errors.description}
              </Form.Text>
            ) : null}
          </Form.Group>
          <Row>
            <Form.Group controlId="formVersion" className="mb-2" as={Col}>
              <Form.Label>Version</Form.Label>
              <Form.Control
                type="text"
                name="version"
                placeholder="Version"
                value={formik.values.version}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.version && formik.errors.version ? (
                <Form.Text className="text-danger">
                  {formik.errors.version}
                </Form.Text>
              ) : null}
            </Form.Group>
            <Form.Group controlId="formSchemaVersion" className="mb-2" as={Col}>
              <Form.Label>Schema Version</Form.Label>
              <Form.Control
                type="text"
                name="schemaVersion"
                placeholder="Schema Version"
                value={formik.values.schemaVersion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.schemaVersion && formik.errors.schemaVersion ? (
                <Form.Text className="text-danger">
                  {formik.errors.schemaVersion}
                </Form.Text>
              ) : null}
            </Form.Group>
            <Form.Group controlId="formVisibility" className="mb-3" as={Col}>
              <Form.Label>Visibility</Form.Label>
              <Form.Control
                as="select"
                name="visibility"
                value={formik.values.visibility}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </Form.Control>
              {formik.touched.visibility && formik.errors.visibility ? (
                <Form.Text className="text-danger">
                  {formik.errors.visibility}
                </Form.Text>
              ) : null}
            </Form.Group>
          </Row>
          <Row className="mb-5">
            <Form.Group controlId="formDataSource" className="mb-2" as={Col}>
              <Form.Label>Data Source</Form.Label>
              <JSONInput
                id="dataSource"
                theme="light_mitsuketa_tribute"
                value={sanitizeData(formik.values.dataSource)}
                placeholder={sanitizeData(formik.values.dataSource)}
                locale={locale}
                height="550px"
                width="100%"
                onChange={(e) => {
                  try {
                    formik.setFieldValue("dataSource", e.jsObject);
                  } catch (error) {
                    console.log(error);
                  }
                }}
              />
              {formik.touched.dataSource && formik.errors.dataSource ? (
                <Form.Text className="text-danger">
                  {formik.errors.dataSource}
                </Form.Text>
              ) : null}
            </Form.Group>
            <Form.Group controlId="formOntology" className="mb-2" as={Col}>
              <Form.Label>Ontology</Form.Label>
              <JSONInput
                id="ontology"
                theme="light_mitsuketa_tribute"
                placeholder={sanitizeData(formik.values.ontology)}
                value={sanitizeData(formik.values.ontology)}
                locale={locale}
                height="550px"
                width="100%"
                onChange={(e) => {
                  try {
                    formik.setFieldValue("ontology", e.jsObject);
                  } catch (error) {
                    console.log(error);
                  }

                }}
              />
              {formik.touched.ontology && formik.errors.ontology ? (
                <Form.Text className="text-danger">
                  {formik.errors.ontology}
                </Form.Text>
              ) : null}
            </Form.Group>
          </Row>
        </Form>
      </Loader>
    </PageLayout>
  );
}

export default Ring;