import {Modal, Spinner} from "react-bootstrap";

export default function UploadFileModal({ref, show}) {
  return (
    <Modal show={show} ref={ref}>
      <Modal.Body
        style={{
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px"
        }}
        className={'Editor'}
      >
      <span>
        Uploading...<br/>
        <Spinner animation="border" role="status"/>
      </span>
      </Modal.Body>
    </Modal>
  );
}