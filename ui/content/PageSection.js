import EditableField from "../editor/EditableField";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useEdit} from "../editor/EditProvider";
import {BsThreeDotsVertical} from "react-icons/bs";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import {usePageContext} from "./Page";
import PageSectionImage from "./PageSectionImage";
import {DropState, FileDropTarget} from "../editor/FileDropTarget";
import Extras from "../extras/Extras";
import {useSiteContext} from "./Site";
import {loremIpsum} from "lorem-ipsum";
import {useTouchContext} from "../../util/TouchProvider";

/**
 * Display a page section.
 *
 * Add editing features if logged in with edit permission.
 *
 * @param sectionData{PageSectionData}  Data for page section.
 * @constructor
 */
export default function PageSection({pageSectionData}) {

  // imports
  const {supportsHover} = useTouchContext();
  const {PageSections} = useRestApi();
  const {canEdit} = useEdit();
  const {
    sectionData,
    setSectionData,
    deletePageSection,
    updatePageSection,
    addExtraModal,
    pageExtras
  } = usePageContext();
  const {showErrorAlert} = useSiteContext();

  // states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [sectionExtras, setSectionExtras] = useState([]);
  const [editing, setEditing] = useState(false);

  // refs
  const dropRef = useRef(null);
  const sectionTitleApi = useRef(null);
  const sectionTextApi = useRef(null);
  const sectionTitleRef = useRef(null);
  const sectionTextRef = useRef(null);
  const sectionImageRef = useRef(null);
  const sectionRef = useRef(null);
  const editButtonRef = useRef(null);

  const onTitleChanged = useCallback(({textContent, textAlign}) => {
    // commit title edits
    console.debug(`Update section title...`);
    pageSectionData.SectionTitle = textContent;
    pageSectionData.TitleAlign = textAlign;
    updatePageSection(pageSectionData);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => console.debug(`Updated section title.`))
      .catch(error => showErrorAlert(`Error updating section title.`, error));
    editButtonRef.current.hidden = false;
    setEditing(false);
  }, [pageSectionData, updatePageSection, PageSections, showErrorAlert]);

  const onTextChanged = useCallback(({textContent, textAlign}) => {
    // commit text edits
    console.debug(`Update section text...`);
    pageSectionData.SectionText = textContent;
    pageSectionData.TextAlign = textAlign;
    updatePageSection(pageSectionData);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => console.debug(`Updated section text.`))
      .catch(error => showErrorAlert(`Error updating section text.`, error));
    editButtonRef.current.hidden = false;
    setEditing(false);
  }, [pageSectionData, updatePageSection, PageSections, showErrorAlert]);

  const onEditCanceled = useCallback(() => {
    // cancel editing
    editButtonRef.current.hidden = false;
    setEditing(false);
  }, [setEditing]);

  useEffect(() => {
    // manage extras
    if (pageExtras && pageSectionData) {
      const list = pageExtras.filter((extra) => extra.PageSectionID === pageSectionData.PageSectionID);
      setSectionExtras(list);
    }
  }, [pageExtras, pageSectionData]);

  useEffect(() => {
    // manage drag scripts
    if (pageSectionData.SectionImage && sectionImageRef.current && dropRef.current) {
      // make section image the drop target
      sectionImageRef.current.ondragenter = (e) => dropRef.current.onDragEnter(e, DropState.REPLACE);
      if (sectionRef.current) {
        sectionRef.current.ondragenter = undefined;
      }
    } else if (!pageSectionData.SectionImage && sectionRef.current && dropRef.current) {
      // make whole section the drop target
      sectionRef.current.ondragenter = (e) => dropRef.current.onDragEnter(e, DropState.ADD);
      if (sectionImageRef.current) {
        sectionImageRef.current.ondragenter = undefined;
      }
    }
  }, [sectionImageRef, pageSectionData, dropRef])

  const onUploadFile = useCallback((file) => {
    // upload a file that has been dropped, selected from a file dialog
    // or pasted from the clipboard
    dropRef.current.setDropState(DropState.UPLOADING);
    PageSections.uploadSectionImage(pageSectionData.PageID, pageSectionData.PageSectionID, file)
      .then((result) => {
        console.debug(`Image uploaded successfully.`);
        dropRef.current.setDropState(DropState.HIDDEN);
        updatePageSection(result);
      })
      .catch(e => {
        showErrorAlert(`Error uploading image.`, e);
        dropRef.current.setDropState(DropState.HIDDEN);
      });
  }, [dropRef, PageSections, pageSectionData, updatePageSection, showErrorAlert]);

  const sectionTitle = useMemo(() => (
    <h2
      ref={sectionTitleRef}
      className={'SectionTitle'}
      dangerouslySetInnerHTML={{__html: pageSectionData.SectionTitle}}
      data-testid={`SectionTitle-${pageSectionData.PageSectionID}`}
      style={{textAlign: pageSectionData.TitleAlign, width: '100%'}}
    />
  ), [pageSectionData]);

  const sectionText = useMemo(() => (
    <div
      className={`SectionText`}
      style={{textAlign: pageSectionData.TextAlign}}
      dangerouslySetInnerHTML={{__html: pageSectionData.SectionText}}
      ref={sectionTextRef}
    />
  ), [pageSectionData]);

  function onInsertLoremIpsum() {
    const textContent = loremIpsum(
      {
        format: 'html',
        count: 4,
        units: 'paragraphs'
      });
    onTextChanged({textContent: textContent, textAlign: pageSectionData.TextAlign});
  }

  function onDeleteSection() {
    if (pageSectionData) {
      PageSections.deletePageSection(pageSectionData.PageID, pageSectionData.PageSectionID)
        .then((result) => {
          console.debug(`Page section deleted.`)
          deletePageSection(result.PageSectionID);
        })
        .catch(error => {
          showErrorAlert(`Error deleting page section.`, error)
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
              .catch(error => showErrorAlert(`Error moving page section up.`, error));
          })
          .catch(error => showErrorAlert(`Error moving page section up.`, error));
      } else {
        showErrorAlert(`Section sequence error, can't move up.`);
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
              .catch(error => showErrorAlert(`Error moving page section down.`, error));
          })
          .catch(error => showErrorAlert(`Error moving page section down.`, error));
      } else {
        showErrorAlert(`Section sequence error, can't move down.`);
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
        for (const section of sectionData) {
          if (section.PageSectionSeq >= newSection.PageSectionSeq) {
            console.debug(`Updating section sequence.`);
            section.PageSectionSeq++;
            PageSections.insertOrUpdatePageSection(section).then((result) => {
              console.debug(`Updated section ${result.PageSectionID} sequence.`);
            }).catch(error => showErrorAlert(`Error updating section sequence.`, error));
          }
        }
        const newSectionData = [...sectionData, newSection]
        newSectionData.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
        setSectionData(newSectionData);
      }).catch(error => showErrorAlert(`Error adding section.`, error));
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
        for (const section of sectionData) {
          if (section.PageSectionSeq >= newSection.PageSectionSeq) {
            console.debug(`Updating section sequence.`);
            section.PageSectionSeq++;
            PageSections.insertOrUpdatePageSection(section).then((result) => {
              console.debug(`Updated section ${result.PageSectionID} sequence.`);
            }).catch(error => showErrorAlert(`Error updating section sequence.`, error));
          }
        }
        const newSectionData = [...sectionData, newSection]
        newSectionData.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
        setSectionData(newSectionData);
      }).catch(error => showErrorAlert(`Error adding section.`, error));
    }
  }

  function onEditTitle() {
    // start editing section title
    sectionTitleApi.current?.startEditing();
    editButtonRef.current.hidden = true;
    setEditing(true);
  }

  function onEditText() {
    // start editing section text
    sectionTextApi.current?.startEditing();
    editButtonRef.current.hidden = true;
    setEditing(true);
  }

  /**
   * See if user is pasting image data.
   */
  function onPaste(e) {
    // handle pasting image data
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        onUploadFile(file);
        e.preventDefault();
      }
    }
  }

  if (!canEdit) {
    // non-editable version of page section
    return (
      <div
        className={`PageSection`}
        ref={sectionRef}
      >
        {sectionTitle}
        <PageSectionImage pageSectionData={pageSectionData}/>
        {sectionText}
        <Extras extras={sectionExtras}/>
      </div>
    );
  } else {
    // editable version of page section
    return (<>
      <div
        className={`PageSection`}
        onMouseOver={() => {
          if (!editing && supportsHover) editButtonRef.current.hidden = false;
        }}
        onMouseLeave={() => {
          if (!editing && supportsHover) editButtonRef.current.hidden = true;
        }}
        onPaste={(e) => {
          if (canEdit) {
            onPaste(e)
          }
        }}
        style={{
          position: 'relative',
          minHeight: '30px',
        }}
        data-testid={`PageSection-${pageSectionData.PageSectionID}`}
        ref={sectionRef}
      >
        <div
          style={{height: '100px'}}
          hidden={
            editing
            || pageSectionData.SectionImage
            || pageSectionData.SectionTitle
            || pageSectionData.SectionText
            || sectionExtras?.length > 0
          }
        >
          <div className={'Editor EmptyElement'}>(Empty Section)</div>
        </div>
        <EditableField
          field={sectionTitle}
          fieldRef={sectionTitleRef}
          apiRef={sectionTitleApi}
          textContent={pageSectionData.SectionTitle}
          textAlign={pageSectionData.TitleAlign}
          callback={onTitleChanged}
          onCancel={onEditCanceled}
        />
        <PageSectionImage
          pageSectionData={pageSectionData}
          imageRef={sectionImageRef}
          dropRef={dropRef}
          onFileSelected={onUploadFile}
        />
        <EditableField
          field={sectionText}
          fieldRef={sectionTextRef}
          apiRef={sectionTextApi}
          textContent={pageSectionData.SectionText}
          textAlign={pageSectionData.TextAlign}
          callback={onTextChanged}
          onCancel={onEditCanceled}
          allowEnterKey={true}
        />
        {!pageSectionData.SectionImage && (
          <FileDropTarget
            ref={dropRef}
            onFileSelected={onUploadFile}
            onError={(err) => {
              showErrorAlert(err);
              dropRef.current.setDropState(DropState.HIDDEN);
            }}
          />
        )}
        <div
          className="Editor EditSectionMenu dropdown"
        >
          <Button
            variant="secondary"
            size="sm"
            className={`EditButton border btn-light`}
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{marginBottom: '10px'}}
            ref={editButtonRef}
            hidden={supportsHover}
          ><BsThreeDotsVertical/></Button>
          <div className="dropdown-menu Editor" style={{cursor: 'pointer', zIndex: 100}}>
              <span className="dropdown-item"
                    onClick={onEditTitle}>{`${pageSectionData?.SectionTitle?.length > 0 ? 'Edit' : 'Add'} Section Title`}</span>
            <span className="dropdown-item"
                  onClick={onEditText}>{`${pageSectionData?.SectionText?.length > 0 ? 'Edit' : 'Add'} Section Text`}</span>
            {!pageSectionData.SectionText && (
              <span className="dropdown-item"
                    onClick={() => onInsertLoremIpsum()}>Add Placeholder Text</span>
            )}
            <span className="dropdown-item"
                  onClick={() => dropRef.current?.selectFile()}>{`${pageSectionData?.SectionImage?.length > 0 ? 'Update' : 'Add'} Section Image`}</span>
            <span className="dropdown-item"
                  onClick={() => addExtraModal({pageSectionId: pageSectionData.PageSectionID})}>Add Extra</span>
            {pageSectionData.PageSectionID !== sectionData[0].PageSectionID && (
              <span className="dropdown-item" onClick={onMoveUp}>Move Up</span>
            )}
            {pageSectionData.PageSectionID !== sectionData[sectionData.length - 1].PageSectionID && (
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
              onDeleteSection();
              setShowDeleteConfirmation(false)
            }}>Delete Section
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <Extras extras={sectionExtras}/>
    </>);
  }
}