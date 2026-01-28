import EditableField from "../editor/EditableField";
import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useEdit} from "../editor/EditProvider";
import {BsPencil} from "react-icons/bs";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import {usePageContext} from "./Page";
import PageSectionImage from "./PageSectionImage";
import {DropState, FileDropTarget} from "../editor/FileDropTarget";
import Extras from "../extras/Extras";

/**
 * Generate a page section
 * @param sectionData{PageSectionData}
 * @constructor
 */
function PageSection({pageSectionData}) {

  const {PageSections} = useRestApi();
  const {canEdit} = useEdit();
  const {
    sectionData,
    setSectionData,
    removePageSection,
    updatePageSection,
    addExtraModal,
    pageExtras
  } = usePageContext();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [uploadPrompt, setUploadPrompt] = useState(pageSectionData.SectionImage ? DropState.REPLACE : DropState.INSERT);
  const [sectionExtras, setSectionExtras] = useState([]);

  const sectionTitleRef = useRef(null);
  const sectionTitle = (
    <h2
      ref={sectionTitleRef}
      className={'SectionTitle'}
      dangerouslySetInnerHTML={{__html: pageSectionData.SectionTitle}}
      data-testid={`SectionTitle-${pageSectionData.PageSectionID}`}
      style={{textAlign: pageSectionData.TitleAlign, width: '100%'}}
    />
  );

  function onTitleChanged({textContent, textAlign}) {
    if (textContent != null) {
      console.debug(`Update section title...`);
      pageSectionData.SectionTitle = textContent;
      pageSectionData.TitleAlign = textAlign;
      PageSections.insertOrUpdatePageSection(pageSectionData)
        .then(() => console.debug(`Updated section title.`))
        .catch(error => console.error(`Error updating section title.`, error));
    }
    setEditingTitle(false);
  }

  const sectionTextRef = useRef(null);
  const sectionText = (
    <div
      className={`SectionText`}
      style={{textAlign: pageSectionData.TextAlign}}
      dangerouslySetInnerHTML={{__html: pageSectionData.SectionText}}
      ref={sectionTextRef}
    />
  );

  function onTextChanged({textContent, textAlign}) {
    if (textContent != null) {
      console.debug(`Update section text...`);
      pageSectionData.SectionText = textContent;
      pageSectionData.TextAlign = textAlign;
      PageSections.insertOrUpdatePageSection(pageSectionData)
        .then(() => console.debug(`Updated section text.`))
        .catch(error => console.error(`Error updating section text.`, error));
    }
    setEditingText(false);
  }

  function deleteSection() {
    if (pageSectionData) {
      PageSections.deletePageSection(pageSectionData.PageID, pageSectionData.PageSectionID)
        .then(() => {
          console.debug(`Page section deleted.`)
          removePageSection(pageSectionData.PageSectionID)
        })
        .catch(error => {
          console.error(`Error deleting page section.`, error)
        });
    }
  }

  function onMoveUp() {
    if (sectionData && pageSectionData) {
      let before;
      let current;
      for (const section of sectionData) {
        if (section.PageSectionID === pageSectionData.PageSectionID) {
          current = section;
          break;
        } else {
          before = section;
        }
      }
      if (current && before) {
        let seq = current.PageSectionSeq;
        current.PageSectionSeq = before.PageSectionSeq;
        before.PageSectionSeq = seq;
        console.debug(`Moving section up...`);
        updatePageSection(current);
        updatePageSection(before);
        PageSections.insertOrUpdatePageSection(before)
          .then(() => {
            PageSections.insertOrUpdatePageSection(current)
              .then(() => {
                console.debug(`Section moved up.`);
              })
              .catch(error => console.error(`Error moving page section up.`, error));
          })
          .catch(error => console.error(`Error moving page section up.`, error));
      } else {
        console.error(`Section sequence error, can't move up.`);
      }
    }
  }

  function onMoveDown() {
    if (sectionData && pageSectionData) {
      let current;
      let next;
      for (const section of sectionData) {
        if (section.PageSectionID === pageSectionData.PageSectionID) {
          current = section;
        } else if (current) {
          next = section;
          break;
        }
      }
      if (current && next) {
        let seq = current.PageSectionSeq;
        current.PageSectionSeq = next.PageSectionSeq;
        next.PageSectionSeq = seq;
        console.debug(`Moving section down...`);
        updatePageSection(next);
        updatePageSection(current);
        PageSections.insertOrUpdatePageSection(next)
          .then(() => {
            PageSections.insertOrUpdatePageSection(current)
              .then(() => {
                console.debug(`Section moved down.`);
              })
              .catch(error => console.error(`Error moving page section down.`, error));
          })
          .catch(error => console.error(`Error moving page section down.`, error));
      } else {
        console.error(`Section sequence error, can't move down.`);
      }
    }
  }

  function onNewSectionAbove() {
    if (sectionData && pageSectionData) {
      console.debug(`Adding page section above...`);
      PageSections.insertOrUpdatePageSection({
        PageID: pageSectionData.PageID,
        PageSectionSeq: pageSectionData.PageSectionSeq,
      }).then((newSection) => {
        console.debug(`Added page section.`);
        let toUpdate = 0;
        let updated = 0;
        for (const section of sectionData) {
          if (section.PageSectionSeq >= newSection.PageSectionSeq) {
            console.debug(`Updating section sequence.`);
            section.PageSectionSeq++;
            ++toUpdate;
            PageSections.insertOrUpdatePageSection(section).then((result) => {
              console.debug(`Updated section ${result.PageSectionID} sequence.`);
              if (++updated === toUpdate) {
                const newSectionData = [...sectionData, newSection]
                newSectionData.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
                setSectionData(newSectionData);
              }
            }).catch(error => console.error(`Error updating section sequence.`, error));
          }
        }
      }).catch(error => console.error(`Error adding section.`, error));
    }
  }

  function onNewSectionBelow() {
    if (sectionData && pageSectionData) {
      console.debug(`Adding page section below...`);
      PageSections.insertOrUpdatePageSection({
        PageID: pageSectionData.PageID,
        PageSectionSeq: pageSectionData.PageSectionSeq + 1,
      }).then((newSection) => {
        console.debug(`Added page section.`);
        let toUpdate = 0;
        let updated = 0;
        for (const section of sectionData) {
          if (section.PageSectionSeq > newSection.PageSectionSeq) {
            console.debug(`Updating section sequence.`);
            section.PageSectionSeq++;
            ++toUpdate;
            PageSections.insertOrUpdatePageSection(section).then((result) => {
              console.debug(`Updated section ${result.PageSectionID} sequence.`);
              if (++updated === toUpdate) {
                const newSectionData = [...sectionData, newSection]
                newSectionData.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
                setSectionData(newSectionData);
              }
            }).catch(error => console.error(`Error updating section sequence.`, error));
          }
        }
      }).catch(error => console.error(`Error adding section.`, error));
    }
  }

  const dropFileRef = useRef(null);
  const fileInputRef = useRef(null);
  const sectionImageRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (sectionImageRef.current && canEdit) {
      sectionImageRef.current.addEventListener('dragenter', dragEnterHandler);
      sectionImageRef.current.addEventListener('dragleave', dragLeaveHandler);
      sectionImageRef.current.addEventListener('dragover', dragOverHandler);
      sectionImageRef.current.addEventListener('drop', dropHandler);
    } else if (canEdit) {
      sectionRef.current.addEventListener('dragenter', dragEnterHandler);
      sectionRef.current.addEventListener('dragleave', dragLeaveHandler);
      sectionRef.current.addEventListener('dragover', dragOverHandler);
      sectionRef.current.addEventListener('drop', dropHandler);
    }
  }, [sectionImageRef, canEdit]);

  useEffect(() => {
    if (pageExtras && pageSectionData) {
      const list = [];
      for (const extra of pageExtras) {
        if (extra.PageSectionID === pageSectionData.PageSectionID) {
          list.push(extra);
        }
      }
      setSectionExtras(list);
    }
  }, [pageExtras, pageSectionData]);

  function selectImageFile() {
    if (fileInputRef.current && canEdit) {
      fileInputRef.current.addEventListener('change', fileSelectedHandler);
      fileInputRef.current.click();
    }
  }

  function fileSelectedHandler(e) {
    const files = [...e.target.files];
    console.debug(`${files.length} file(s) selected.`);
    if (files.length === 1) {
      uploadFile(files[0]);
    }
    e.preventDefault();
  }

  function dragEnterHandler(e) {
    if (dropFileRef.current) {
      dropFileRef.current.hidden = false;
    }
    e.preventDefault();
  }

  function dragOverHandler(e) {
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      if (fileItems.some((item) => item.type.startsWith("image/"))) {
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    }
  }

  function dropHandler(e) {
    const files = [...e.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => file);
    console.debug(`${files.length} file(s) dropped.`);
    if (files.length === 1) {
      uploadFile(files[0]);
    }
    e.preventDefault();
  }

  function uploadFile(file) {
    if (dropFileRef.current) {
      dropFileRef.current.hidden = false;
    }
    setUploadPrompt(DropState.UPLOADING);
    PageSections.uploadSectionImage(pageSectionData.PageID, pageSectionData.PageSectionID, file)
      .then((result) => {
        console.debug(`Image uploaded successfully.`);
        if (dropFileRef.current) {
          dropFileRef.current.hidden = true;
        }
        setUploadPrompt(pageSectionData.SectionImage ? DropState.REPLACE : DropState.INSERT);
        updatePageSection(result);
      })
      .catch(e => {
        console.error(`Error uploading image.`, e);
        dropFileRef.current.hidden = true;
      });
  }

  function dragLeaveHandler(e) {
    console.debug(`Image drag leave...`);
    if (dropFileRef.current) {
      dropFileRef.current.hidden = true;
    }
    e.preventDefault();
  }

  return (
    <PageSectionContext value={{
      pageSectionData: pageSectionData,
      sectionExtras: sectionExtras
    }}>
      <div
        className={`PageSection`}
        style={{
          position: 'relative',
          minHeight:
            canEdit
            && !pageSectionData.SectionText
            && !pageSectionData.SectionTitle
            && sectionExtras.length === 0
              ? '40px' : 0,
          margin: pageSectionData.SectionText
          || pageSectionData.SectionTitle
          || sectionExtras.length ? undefined : 0
        }}
        data-testid={`PageSection-${pageSectionData.PageSectionID}`}
        ref={sectionRef}
      >
        {canEdit ? (<>
          <EditableField
            field={sectionTitle}
            fieldRef={sectionTitleRef}
            textContent={pageSectionData.SectionTitle}
            textAlign={pageSectionData.TitleAlign}
            callback={onTitleChanged}
            editing={editingTitle}
          />
          <PageSectionImage
            pageSectionData={pageSectionData}
            imageRef={sectionImageRef}
            dropTargetRef={dropFileRef}
            dropTargetState={uploadPrompt}
          />
          <EditableField
            field={sectionText}
            fieldRef={sectionTextRef}
            textContent={pageSectionData.SectionText}
            textAlign={pageSectionData.TextAlign}
            callback={onTextChanged}
            allowEnterKey={true}
            editing={editingText}
          />
          <input type="file" ref={fileInputRef} hidden={true}/>
          {!editingText && !editingTitle && (
            <div
              className="dropdown"
              style={{position: 'absolute', top: '2px', right: '2px', zIndex: sectionData.PageSectionSeq}}
            >
              <Button
                variant="secondary"
                size="sm"
                style={{border: 'none', boxShadow: 'none', margin: '2px', padding: '2px 5px', zIndex: 200}}
                className={`border btn-light`}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              ><BsPencil/></Button>
              <div className="dropdown-menu Editor" style={{cursor: 'pointer', zIndex: 300}}>
              <span className="dropdown-item"
                    onClick={() => setEditingTitle(true)}>{`${pageSectionData?.SectionTitle?.length > 0 ? 'Edit' : 'Add'} Section Title`}</span>
                <span className="dropdown-item"
                      onClick={() => setEditingText(true)}>{`${pageSectionData?.SectionText?.length > 0 ? 'Edit' : 'Add'} Section Text`}</span>
                <span className="dropdown-item"
                      onClick={selectImageFile}>{`${pageSectionData?.SectionImage?.length > 0 ? 'Update' : 'Add'} Section Image`}</span>
                <span className="dropdown-item"
                      onClick={() => addExtraModal({pageSectionId: pageSectionData.PageSectionID})}>Add Extra</span>
                {pageSectionData.PageSectionID !== sectionData[0].PageSectionID && (
                  <span className="dropdown-item" onClick={onMoveUp}>Move Up</span>
                )}
                {pageSectionData.PageSectionID !== sectionData[sectionData.length-1].PageSectionID && (
                  <span className="dropdown-item" style={{marginLeft: '0'}} onClick={onMoveDown}>Move
                  Down</span>
                )}
                <span className="dropdown-item" style={{marginLeft: '0'}}
                      onClick={onNewSectionAbove}>New Section Above</span>
                <span className="dropdown-item" style={{marginLeft: '0'}}
                      onClick={onNewSectionBelow}>New Section Below</span>
                <span className="dropdown-item" onClick={() => setShowDeleteConfirmation(true)}> Delete Section</span>
              </div>
            </div>
          )}
          {!pageSectionData.SectionImage && (
            <FileDropTarget state={uploadPrompt} ref={dropFileRef}/>
          )}
          <Modal
            show={showDeleteConfirmation}
            onHide={() => setShowDeleteConfirmation(false)}
            className={'Editor'}
          >
            <ModalHeader><h5>Delete Page Section</h5></ModalHeader>
            <ModalBody>Are you sure you want to delete this section of the page? This action cannot be
              undone.</ModalBody>
            <ModalFooter>
              <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={() => {
                deleteSection();
                setShowDeleteConfirmation(false)
              }}>Delete Section
              </Button>
            </ModalFooter>
          </Modal>
        </>) : (<>
          {pageSectionData.SectionTitle && (<>
            {sectionTitle}
          </>)}
          <PageSectionImage
            pageSectionData={pageSectionData}
          />
          {pageSectionData.SectionText && (<>
            {sectionText}
          </>)}
        </>)}
      </div>
      <Extras/>
    </PageSectionContext>
  );
}

const PageSectionContext = createContext({});

export function usePageSectionContext() {
  return useContext(PageSectionContext);
}

export default PageSection;